export const programSchema = `
  type programs {
    id: ID!
    name: String
    description: String
    createdAt: String
    updatedAt: String
  }

  input programsFilter {
    id: ID
    name: String
  }

  type programsPage {
    items: [programs!]!
    next: String
    prev: String
  }
`as const;

export const programQueries = `
  programs(id: String!): programs
  programss(
    after: String
    before: String
    limit: Int
    orderBy: String
    orderDirection: String
    where: programsFilter
  ): programsPage!
` as const;