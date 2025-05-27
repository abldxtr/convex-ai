"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResumableStreamContext = createResumableStreamContext;
exports.resumeStream = resumeStream;
const redis_1 = require("redis");
function getRedisUrl() {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
    if (!redisUrl) {
        throw new Error("REDIS_URL environment variable is not set");
    }
    return redisUrl;
}
/**
 * Creates a Subscriber adapter for a Redis client.
 * @param client - The Redis client to adapt
 * @returns A Subscriber interface compatible with the resumable stream
 */
function createSubscriberAdapter(client) {
    const adapter = {
        connect: () => client.connect(),
        subscribe: async function (channel, callback) {
            client.on("message", (innerChannel, message) => {
                if (channel === innerChannel) {
                    callback(message);
                }
            });
            await client.subscribe(channel);
        },
        unsubscribe: (channel) => client.unsubscribe(channel),
    };
    return adapter;
}
/**
 * Creates a Publisher adapter for a Redis client.
 * @param client - The Redis client to adapt
 * @returns A Publisher interface compatible with the resumable stream
 */
function createPublisherAdapter(client) {
    const adapter = {
        connect: () => client.connect(),
        publish: (channel, message) => client.publish(channel, message),
        set: (key, value, options) => {
            if (options === null || options === void 0 ? void 0 : options.EX) {
                return client.set(key, value, "EX", options.EX);
            }
            return client.set(key, value);
        },
        get: (key) => client.get(key),
        incr: (key) => client.incr(key),
    };
    return adapter;
}
/**
 * Creates a global context for resumable streams from which you can create resumable streams.
 *
 * Call `resumableStream` on the returned context object to create a stream.
 *
 * @param options - The context options.
 * @param options.keyPrefix - The prefix for the keys used by the resumable streams. Defaults to `resumable-stream`.
 * @param options.waitUntil - A function that takes a promise and ensures that the current program stays alive until the promise is resolved.
 * @param options.subscriber - A pubsub subscriber. Designed to be compatible with clients from the `redis` package. If not provided, a new client will be created based on REDIS_URL or KV_URL environment variables.
 * @param options.publisher - A pubsub publisher. Designed to be compatible with clients from the `redis` package. If not provided, a new client will be created based on REDIS_URL or KV_URL environment variables.
 * @returns A resumable stream context.
 */
function createResumableStreamContext(options) {
    const ctx = {
        keyPrefix: `${options.keyPrefix || "resumable-stream"}:rs`,
        waitUntil: options.waitUntil,
        subscriber: options.subscriber,
        publisher: options.publisher,
    };
    let initPromises = [];
    if (!ctx.subscriber) {
        ctx.subscriber = (0, redis_1.createClient)({
            url: getRedisUrl(),
        });
        initPromises.push(ctx.subscriber.connect());
    }
    if (!ctx.publisher) {
        ctx.publisher = (0, redis_1.createClient)({
            url: getRedisUrl(),
        });
        initPromises.push(ctx.publisher.connect());
    }
    if (options.subscriber && options.subscriber.defineCommand) {
        ctx.subscriber = createSubscriberAdapter(options.subscriber);
    }
    if (options.publisher && options.publisher.defineCommand) {
        ctx.publisher = createPublisherAdapter(options.publisher);
    }
    return {
        resumeExistingStream: async (streamId, skipCharacters) => {
            return resumeExistingStream(Promise.all(initPromises), ctx, streamId, skipCharacters);
        },
        createNewResumableStream: async (streamId, makeStream, skipCharacters) => {
            const initPromise = Promise.all(initPromises);
            await initPromise;
            await ctx.publisher.set(`${ctx.keyPrefix}:sentinel:${streamId}`, "1", {
                EX: 24 * 60 * 60,
            });
            return createNewResumableStream(initPromise, ctx, streamId, makeStream);
        },
        resumableStream: async (streamId, makeStream, skipCharacters) => {
            return createResumableStream(Promise.all(initPromises), ctx, streamId, makeStream, skipCharacters);
        },
    };
}
const DONE_MESSAGE = "\n\n\nDONE_SENTINEL_hasdfasudfyge374%$%^$EDSATRTYFtydryrte\n";
const DONE_VALUE = "DONE";
async function resumeExistingStream(initPromise, ctx, streamId, skipCharacters) {
    await initPromise;
    const state = await ctx.publisher.get(`${ctx.keyPrefix}:sentinel:${streamId}`);
    if (!state) {
        return undefined;
    }
    if (state === DONE_VALUE) {
        return null;
    }
    return resumeStream(ctx, streamId, skipCharacters);
}
async function createNewResumableStream(initPromise, ctx, streamId, makeStream) {
    await initPromise;
    const chunks = [];
    let listenerChannels = [];
    let streamDoneResolver;
    ctx.waitUntil(new Promise((resolve) => {
        streamDoneResolver = resolve;
    }));
    let isDone = false;
    // This is ultimately racy if two requests for the same ID come at the same time.
    // But this library is for the case where that would not happen.
    await ctx.subscriber.subscribe(`${ctx.keyPrefix}:request:${streamId}`, async (message) => {
        const parsedMessage = JSON.parse(message);
        listenerChannels.push(parsedMessage.listenerId);
        debugLog("parsedMessage", chunks.length, parsedMessage.skipCharacters);
        const chunksToSend = chunks.join("").slice(parsedMessage.skipCharacters || 0);
        debugLog("sending chunks", chunksToSend.length);
        const promises = [];
        promises.push(ctx.publisher.publish(`${ctx.keyPrefix}:chunk:${parsedMessage.listenerId}`, chunksToSend));
        if (isDone) {
            promises.push(ctx.publisher.publish(`${ctx.keyPrefix}:chunk:${parsedMessage.listenerId}`, DONE_MESSAGE));
        }
        await Promise.all(promises);
    });
    return new ReadableStream({
        start(controller) {
            const stream = makeStream();
            const reader = stream.getReader();
            function read() {
                reader.read().then(async ({ done, value }) => {
                    if (done) {
                        isDone = true;
                        debugLog("Stream done");
                        try {
                            controller.close();
                        }
                        catch (e) {
                            //console.error(e);
                        }
                        const promises = [];
                        debugLog("setting sentinel to done");
                        promises.push(ctx.publisher.set(`${ctx.keyPrefix}:sentinel:${streamId}`, DONE_VALUE, {
                            EX: 24 * 60 * 60,
                        }));
                        promises.push(ctx.subscriber.unsubscribe(`${ctx.keyPrefix}:request:${streamId}`));
                        for (const listenerId of listenerChannels) {
                            debugLog("sending done message to", listenerId);
                            promises.push(ctx.publisher.publish(`${ctx.keyPrefix}:chunk:${listenerId}`, DONE_MESSAGE));
                        }
                        await Promise.all(promises);
                        streamDoneResolver === null || streamDoneResolver === void 0 ? void 0 : streamDoneResolver();
                        debugLog("Cleanup done");
                        return;
                    }
                    chunks.push(value);
                    try {
                        debugLog("Enqueuing line", value);
                        controller.enqueue(value);
                    }
                    catch (e) {
                        // If we cannot enqueue, the stream is already closed, but we WANT to continue.
                    }
                    const promises = [];
                    for (const listenerId of listenerChannels) {
                        debugLog("sending line to", listenerId);
                        promises.push(ctx.publisher.publish(`${ctx.keyPrefix}:chunk:${listenerId}`, value));
                    }
                    await Promise.all(promises);
                    read();
                });
            }
            read();
        },
    });
}
/**
 * Creates a resumable stream of strings.
 *
 * @param streamId - The ID of the stream.
 * @param makeStream - A function that returns a stream of strings. It's only executed if the stream it not yet in progress.
 * @returns A stream of strings.
 */
async function createResumableStream(initPromise, ctx, streamId, makeStream, skipCharacters) {
    await initPromise;
    const currentListenerCount = await incrOrDone(ctx.publisher, `${ctx.keyPrefix}:sentinel:${streamId}`);
    debugLog("currentListenerCount", currentListenerCount);
    if (currentListenerCount === DONE_VALUE) {
        return null;
    }
    if (currentListenerCount > 1) {
        return resumeStream(ctx, streamId, skipCharacters);
    }
    return createNewResumableStream(initPromise, ctx, streamId, makeStream);
}
async function resumeStream(ctx, streamId, skipCharacters) {
    const listenerId = crypto.randomUUID();
    return new Promise((resolve, reject) => {
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    debugLog("STARTING STREAM");
                    const cleanup = async () => {
                        await ctx.subscriber.unsubscribe(`${ctx.keyPrefix}:chunk:${listenerId}`);
                    };
                    const start = Date.now();
                    const timeout = setTimeout(async () => {
                        await cleanup();
                        const val = await ctx.publisher.get(`${ctx.keyPrefix}:sentinel:${streamId}`);
                        if (val === DONE_VALUE) {
                            resolve(null);
                        }
                        if (Date.now() - start > 1000) {
                            controller.error(new Error("Timeout waiting for ack"));
                        }
                    }, 1000);
                    await Promise.all([
                        ctx.subscriber.subscribe(`${ctx.keyPrefix}:chunk:${listenerId}`, async (message) => {
                            // The other side always sends a message even if it is the empty string.
                            clearTimeout(timeout);
                            resolve(readableStream);
                            if (message === DONE_MESSAGE) {
                                try {
                                    controller.close();
                                }
                                catch (e) {
                                    console.error(e);
                                }
                                await cleanup();
                                return;
                            }
                            try {
                                controller.enqueue(message);
                            }
                            catch (e) {
                                console.error(e);
                                await cleanup();
                            }
                        }),
                        ctx.publisher.publish(`${ctx.keyPrefix}:request:${streamId}`, JSON.stringify({
                            listenerId,
                            skipCharacters,
                        })),
                    ]);
                }
                catch (e) {
                    reject(e);
                }
            },
        });
    });
}
function incrOrDone(publisher, key) {
    return publisher.incr(key).catch((reason) => {
        const errorString = String(reason);
        if (errorString.includes("ERR value is not an integer or out of range")) {
            return DONE_VALUE;
        }
        throw reason;
    });
}
function debugLog(...messages) {
    if (process.env.DEBUG || process.env.NODE_ENV === "test") {
        console.log(...messages);
    }
}
//# sourceMappingURL=index.js.map