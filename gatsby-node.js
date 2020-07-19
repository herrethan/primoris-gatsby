const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)


exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
                source
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    // Safe keeping if we ever need a blog
    // const previous = index === posts.length - 1 ? null : posts[index + 1].node
    // const next = index === 0 ? null : posts[index - 1].node

    // createPage({
    //   path: post.node.fields.slug,
    //   component: blogPost,
    //   context: {
    //     slug: post.node.fields.slug,
    //     previous,
    //     next,
    //   },
    // })

    // Prepend /calendar only to source:calendar entries
    let path = post.node.fields.slug;
    if (post.node.fields.source === 'calendar') {
      path = `/calendar${path}`;
    }
    console.log(path);
    createPage({
      path,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    const parent = getNode(node.parent);

    
    createNodeField({
      name: `source`,
      value: parent && parent.sourceInstanceName,
      node,
    })

    createNodeField({
      name: `slug`,
      node,
      value,
    })

  }
}
