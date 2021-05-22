import React from "react";
import { Link } from "gatsby";
import { graphql } from "gatsby";
import SEO from "../components/seo";
import Header from '../components/header';
import Footer from '../components/footer';
import Hero from '../../static/img/hero-gallery.png';
import { useFlexSearch } from 'react-use-flexsearch';
import Magnifier from "../components/magnifier";

const EXCERPT_TRIM_LENGTH = 500;
const MATCH_PADDING = 50;

const flattenNodes = nodes => nodes.map(node => ({ 
  id: node.id,
  excerpt: node.excerpt,
  slug: node.fields.slug,
  title: node.frontmatter.title
}));

const trimExcerpt = (string, query) => {
  let start = string.toLowerCase().indexOf(query.toLowerCase());
  let end = string.toLowerCase().lastIndexOf(query.toLowerCase());
  if (end > -1) {
    start = start - MATCH_PADDING;
    end = end + MATCH_PADDING;
    return `...${string.slice(start < 0 ? 0 : start, end)}...`;
  }
  return string;
}

const highlight = (string, query) => string.replace(new RegExp(query, 'gi'), `<span class="highlighted">${query}</span>`);

const PageEntry = ({ slug, title, excerpt, query }) => {
  // strip out all html tags from excerpt and title and highlight the search term
  let text = excerpt.replace(/(<([^>]+)>)/gi, "");
  let heading = title;

  if (query) {
    text = trimExcerpt(text, query);
    text = highlight(text, query);
    heading = highlight(heading, query);
  } else {
    text =  text.length > EXCERPT_TRIM_LENGTH ? `${text.slice(0, EXCERPT_TRIM_LENGTH)}...` : text;
  }

  return (
    <Link to={slug} className="search-result">
      <h3 dangerouslySetInnerHTML={{ __html: heading  }} />
      <div dangerouslySetInnerHTML={{ __html: text  }} /> 
    </Link>
  )
}

const Search = ({ 
    data: { 
      localSearchPages: { index, store }, 
      allMarkdownRemark: { nodes }
    }
  }) => {
  const { search } = window.location;
  const query = new URLSearchParams(search).get('s');
  const [searchQuery, setSearchQuery] = React.useState(query || '');
  const allowedQuery = searchQuery.length > 1 ? searchQuery : '';
  const searchResults = useFlexSearch(allowedQuery, index, store);
  const results = allowedQuery ? searchResults : flattenNodes(nodes);

  return (
    <>
      <SEO
        title={''}
        description="Search Primoris"
      />
      <Header height={180} backgroundImg={Hero} />
        <main className="content">
          <div className="row">
            <div className="column medium-8 medium-centered">
              <form action="/search" method="get" autoComplete="off" className="form-style" style={{position: 'relative'}}>
                <button className="icon-button" style={{position: 'absolute', left: 5, top: 2}}><Magnifier /></button>
                <label htmlFor="site-search">
                  <span className="offscreen">
                      Search Primoris
                  </span>
                </label>
                <input
                  value={searchQuery}
                  style={{paddingLeft: 40}}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  type="text"
                  id="site-search"
                  placeholder="Search Primoris"
                  name="s"
                />
              </form>
            </div>
          </div>
          <div className="row content">
            {results.length > 0 && results.map(result => <PageEntry key={result.id} {...result} query={allowedQuery} />)}
            {results.length === 0 && <h2>No results found.</h2>}
          </div>
        </main>
      <Footer />
    </>
  )
}

export default Search


export const pageQuery = graphql`
  query {
    localSearchPages {
      index
      store
    }
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
  `;
