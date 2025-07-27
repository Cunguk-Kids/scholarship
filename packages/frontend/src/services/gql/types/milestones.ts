export const milestoneSchema = `
  type milestones {
    id: ID!
    title: String
    description: String
    dueDate: String
    createdAt: String
    updatedAt: String
  }

  input milestonesFilter {
    id: ID
    title: String
  }

  type milestonesPage {
    items: [milestones!]!
    next: String
    prev: String
  }
` as const;

export const milestoneQueries = `
  milestones(id: String!): milestones
  milestoness(
    after: String
    before: String
    limit: Int
    orderBy: String
    orderDirection: String
    where: milestonesFilter
  ): milestonesPage!
`as const;
