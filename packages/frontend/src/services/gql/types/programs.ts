export const programSchema = `
  type programs {
  id: String!
  blockchainId: Int
  name: String
  creator: String
  metadataCID: String
  description: String
  startAt: String
  endAt: String
  votingAt: String
  ongoingAt: String
  rules: String
  totalRecipients: Int
  totalFund: Int
  milestoneType: String
  createdAt: String
  updatedAt: String
  students(
  where: studentsFilter
  orderBy: String
  orderDirection: String
  before: String
  after: String
  limit: Int
  ): studentsPage
  milestones(
  where: milestonesFilter
  orderBy: String
  orderDirection: String
  before: String
  after: String
  limit: Int
  ): milestonesPage
  votes(
  where: votesFilter
  orderBy: String
  orderDirection: String
  before: String
  after: String
  limit: Int
  ): votesPage
  }


  input programsFilter {
    id: ID
    name: String
    creator: String
    blockchainId: Int
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