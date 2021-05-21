module.exports = {
  siteMetadata: {
    title: `Primoris Academy`,
    author: {
      name: `Ethan Herr`,
      summary: `herrmedia.com`,
    },
    description: `A vibrant and nurturing school for the passionately curious`,
    siteUrl: `https://primorisacademy.org/`,
    social: {
      twitter: `primorisacademy`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/page`,
        name: `page`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/calendar`,
        name: `calendar`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: "gatsby-plugin-google-tagmanager",
      options: {
        id: "GTM-KTX4DC2",
        includeInDevelopment: false,
        defaultDataLayer: { platform: "gatsby" },
        // Specify optional GTM environment details.
        // gtmAuth: "YOUR_GOOGLE_TAGMANAGER_ENVIRONMENT_AUTH_STRING",
        // gtmPreview: "YOUR_GOOGLE_TAGMANAGER_ENVIRONMENT_PREVIEW_NAME",
        // dataLayerName: "YOUR_DATA_LAYER_NAME",
        // Name of the event that is triggered
        // on every Gatsby route change.
        //
        // Defaults to gatsby-route-change
        routeChangeEventName: "route-change",
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Primoris Academy`,
        short_name: `Primoris`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#87b840`,
        display: `minimal-ui`,
        icon: `content/assets/primoris-icon.png`,
      },
    },
    {
      resolve: 'gatsby-plugin-local-search',
      options: {
          name: 'pages',
          engine: 'flexsearch',
          query: `
            query {
              allMarkdownRemark {
                nodes {
                  id
                  excerpt(pruneLength: 5000, format: HTML)
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                  }
                }
              }
            }
          `,
          ref: 'id',
          index: ['title', 'excerpt'],
          store: ['id', 'title', 'excerpt', 'slug'],
          normalizer: ({ data }) =>
            data.allMarkdownRemark.nodes.map(node => ({
                id: node.id,
                excerpt: node.excerpt,
                slug: node.fields.slug,
                title: node.frontmatter.title,
            })),
      }
    },
    `gatsby-plugin-react-helmet`,
    // {
    //   resolve: `gatsby-plugin-typography`,
    //   options: {
    //     pathToConfigModule: `src/utils/typography`,
    //   },
    // },
    `gatsby-plugin-netlify-cms`
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
