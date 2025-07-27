export const studentSchema = `
  type students {
    id: ID!
    name: String
    email: String
  }

  input studentsFilter {
    id: ID
    name: String
  }

  type studentsPage {
    items: [students!]!
    next: String
    prev: String
  }

`as const;

export const studentQueries = `
  students(id: String!): students
  studentss(
    after: String
    before: String
    limit: Int
    orderBy: String
    orderDirection: String
    where: studentsFilter
  ): studentsPage!
` as const;