import gql   from 'graphql-tag';


export const InitializationQuery = gql`
query Initialization {
  shop {
    name
  }
}
`;


