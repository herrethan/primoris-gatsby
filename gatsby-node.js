const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const templates = {
  'page': path.resolve(`./src/templates/page.js`),
  'calendar': path.resolve(`./src/templates/blog-post.js`)
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

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
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create all pages
  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach((post, index) => {
    // Safe keeping if we ever need a blog
    // const blogPost = path.resolve(`./src/templates/blog-post.js`)
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

    const slug = post.node.fields.slug;
    const source = post.node.fields.source;
    let path = slug;
    
    // Prepend /calendar only to source:calendar entries
    if (source === 'calendar') {
      path = `/calendar${path}`;
    }
    
    console.log(path, source);

    if (source in templates){
      createPage({
        path,
        component: templates[source],
        context: { slug },
      });
    }
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const parent = getNode(node.parent);

    createNodeField({
      name: `source`,
      value: parent && parent.sourceInstanceName,
      node,
    });

    createNodeField({
      name: `slug`,
      value: createFilePath({ node, getNode }),
      node,
    });
  }
}
