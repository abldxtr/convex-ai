import { queryOptions } from "@tanstack/react-query";

export const AllUserData = queryOptions({
  queryKey: ["posts"],
  queryFn: async (chatId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/user-data?chatId=${chatId}`
    );

    return response.json();
  },
});

// const { data } = useSuspenseQuery(AllUserData);
