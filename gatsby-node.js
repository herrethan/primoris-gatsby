const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const templates = {
  'page': path.resolve(`./src/templates/page.js`),
  'calendar': path.resolve(`./src/templates/calendar-event.js`),
  'calendar-index': path.resolve(`./src/templates/calendar-index.js`)
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
    let component = templates[source];
    // let path = slug;
    

    // Use special calendar-index as main calendar page
    if (slug === '/calendar/') {
      component = templates['calendar-index'];
    }
    
    console.log(path, source);

    if (component){
      createPage({
        path: slug,
        component,
        context: { slug },
      });
    }
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const parent = getNode(node.parent);
    const source = parent && parent.sourceInstanceName;
    let slug = createFilePath({ node, getNode });

    // Prepend /calendar only to source:calendar event entries
    if (source === 'calendar') {
      slug = `/calendar${slug}`;
    }

    createNodeField({
      name: `source`,
      value: source,
      node,
    });

    createNodeField({
      name: `slug`,
      value: slug,
      node,
    });
  }
}
