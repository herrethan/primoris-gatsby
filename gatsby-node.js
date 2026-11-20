const path = require(`path`)
const { createFilePath, loadNodeContent } = require(`gatsby-source-filesystem`)
const { readCalendarCsv } = require('./scripts/lib/calendar-csv.cjs')

const templates = {
  'page': path.resolve(`./src/templates/page.js`),
  'contact': path.resolve(`./src/templates/contact.js`),
  'calendar': path.resolve(`./src/templates/calendar-event.js`),
  'calendar-index': path.resolve(`./src/templates/calendar-index.js`)
}

// Keep optional fields stable in both development and production schemas.
exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type MarkdownRemarkFrontmatter {
      reviewed: Boolean
    }
    type CalendarEvent implements Node @dontInfer {
      slug: String!
      title: String!
      date: Date! @dateformat
      endDate: Date @dateformat
      category: String!
      noSchool: Boolean!
      time: String
      detail: String!
    }
  `);
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions;

  // Preserve bookmarks when school divisions move out of Programs.
  const schoolRedirects = {
    '/programs': '/schools/',
    '/programs/high-school': '/schools/high-school/',
    '/programs/middle-school': '/schools/middle-school/',
    '/programs/pre-school': '/schools/preschool/',
  };
  Object.entries(schoolRedirects).forEach(([fromPath, toPath]) => {
    [fromPath, `${fromPath}/`].forEach(legacyPath => {
      createRedirect({ fromPath: legacyPath, toPath, isPermanent: true, redirectInBrowser: true });
    });
  });

  const result = await graphql(
    `
      {
        allCalendarEvent {
          nodes { id slug }
        }
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
    const slug = post.node.fields.slug;
    const source = post.node.fields.source;
    let component = templates[source];

    // Use special calendar-index template as main calendar page
    if (slug === '/calendar/') {
      component = templates['calendar-index'];
    }

    // Use special contact template for contact page
    if (slug === '/contact/') {
      component = templates['contact'];
    }
    
    console.log(slug, source);

    if (component){
      createPage({
        path: slug,
        component,
        context: { slug },
      });
    }
  })

  result.data.allCalendarEvent.nodes.forEach(event => {
    createPage({
      path: event.slug,
      component: templates['calendar'],
      context: { id: event.id },
    });
  });
}

exports.onCreateNode = async ({ node, actions, getNode, getNodesByType, createNodeId, createContentDigest }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'File' && node.sourceInstanceName === 'calendar' && node.extension === 'csv') {
    let events;
    try {
      events = readCalendarCsv(await loadNodeContent(node));
    } catch (error) {
      throw new Error(`${node.absolutePath}: ${error.message}`);
    }
    const eventIds = new Set();
    events.forEach(event => {
      const id = createNodeId(`calendar-event:${event.slug}`);
      eventIds.add(id);
      actions.createNode({
        ...event, id, parent: node.id, children: [],
        internal: { type: 'CalendarEvent', contentDigest: createContentDigest(event) },
      });
      actions.createParentChildLink({ parent: node, child: { id } });
    });
    // Remove deleted rows during live preview as well as production rebuilds.
    getNodesByType('CalendarEvent').filter(event => event.parent === node.id && !eventIds.has(event.id))
      .forEach(event => actions.deleteNode(event));
  }

  if (node.internal.type === `MarkdownRemark`) {
    const parent = getNode(node.parent);
    const source = parent && parent.sourceInstanceName;
    const name = node.frontmatter && node.frontmatter.name;
    let slug = createFilePath({ node, getNode });

    // Page URLs follow their content name, independently of the Markdown filename.
    if (source === 'page' && name) {
      const segments = name.split('/').map(segment => segment.trim().replace(/\s+/g, '-')).filter(Boolean);
      slug = `/${segments.join('/')}/`;
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
