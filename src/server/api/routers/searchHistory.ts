import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

export const searchHistoryRouter = createTRPCRouter({
  add: publicProcedure.input(z.object({ query: z.string() })).mutation(async ({ ctx, input }) => {
    // Upsert doesn't work there with sqlite
    const searchHistory = await ctx.prisma.searchHistory.findFirst({
      where: { query: input.query },
    })

    if (searchHistory) {
      await ctx.prisma.searchHistory.update({
        where: { id: searchHistory.id },
        data: { searchCount: searchHistory.searchCount + 1 },
      })
    }

    if (!searchHistory) {
      await ctx.prisma.searchHistory.create({
        data: { query: input.query, searchCount: 1 },
      })
    }

    return true
  }),

  getTopSearches: publicProcedure.input(z.object({ limit: z.number().default(10) })).query(async ({ ctx, input }) => {
    const topSearches = await ctx.prisma.searchHistory.findMany({
      orderBy: { searchCount: "desc" },
      take: input.limit,
    })

    return topSearches
  }),
})
