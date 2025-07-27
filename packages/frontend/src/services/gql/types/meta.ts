export default `
  type Meta {
    block: Int
    deployment: String
  }

  extend type Query {
    _meta: Meta
  }
`;
