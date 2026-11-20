## Preview on your computer and shared Wi-Fi

Use Node.js 16 for this Gatsby 3 project (the version configured in Netlify).
With dependencies installed, run:

```sh
npm run develop:lan
```

Open `http://localhost:8000/departments/math/` on this computer. On another
computer, phone, or tablet connected to the same Wi-Fi, replace `localhost`
with this Mac's local IP address, for example
`http://10.1.11.226:8000/departments/math/`. Find the current Wi-Fi address in
System Settings > Wi-Fi > Details > TCP/IP, or run `ipconfig getifaddr en0`.
The address can change when the Mac reconnects.

Keep the terminal running and the Mac awake. If another device cannot connect,
allow Node's incoming connections in the macOS firewall and check that the
Wi-Fi permits devices to talk to one another (guest networks often do not).
Use Ctrl-C in the server terminal to stop sharing. This previews local changes;
it does not deploy the production website.

## Editing the school calendar

All events live in **[`content/calendar/events.csv`](content/calendar/events.csv)**,
with one row per event. Open it in Excel or Google Sheets, make changes, then
save/export it as **CSV (UTF-8, comma-separated)** back to the same path. Keep
the header row. Gatsby reads the CSV directly; there are no per-event Markdown
files to maintain. CSV saves update the running local preview automatically.

| Column | What to enter |
| --- | --- |
| `slug` | Unique event URL such as `/calendar/family-picnic/`. Keep existing values to preserve bookmarks. |
| `title` | Event name. |
| `date` | First day, formatted `YYYY-MM-DD`. |
| `endDate` | Optional last day, inclusive, formatted `YYYY-MM-DD`. |
| `category` | `school`, `closed`, `formal`, `theme`, or `conferences`. |
| `time` | Optional Eastern time, for example `6:00 PM`. Leave blank when unspecified. |
| `noSchool` | `true` or `false`; include conferences that close school in the No school filter. |
| `detail` | Optional notes, such as a rain date or field-trip details. |

Spreadsheet exports quote commas and multiline notes automatically. When editing
the CSV by hand, enclose those cells in double quotes and escape a quote as `""`.
Invalid dates, categories, duplicate URLs, and malformed rows produce errors with
the CSV row number. Removing a row removes that event from the calendar and its
detail page. Events remain included in site search.

School-year boundaries, preliminary status, and trimester dates live in
`content/calendar-settings.json`. The calendar introduction is still editable as
a Page in the CMS; events are maintained in the CSV rather than a CMS collection.
Run `npm run test:calendar` to validate CSV data and calendar behavior.

## Page filenames

Each page has a descriptive Markdown filename inside its asset folder, for
example `content/page/about/about.md` or
`content/page/departments-science/departments-science.md`. Relative image paths
still point to files in the same folder. The frontmatter `name` sets the public
URL: `name: departments/science` becomes `/departments/science/`, regardless of
the filename. Keep `name` unchanged when renaming a file. New pages created in
the CMS also use descriptive filenames.

## Department page prototype

Department links and their Science / Humanities / Enrichment groups live in
`content/navigation.yml` and can be edited in the CMS. The dropdown, department
directories, and subject strip all use that data. Departments stays in the main
header on every page. On desktop department pages, a fixed submenu below the
header shows the subjects in the current group. Subject banners are 220px tall.
Mobile retains the grouped main menu and subject strip. Existing department URLs remain accessible; new subjects have distinct URLs.

Mathematics (`content/page/departments-math/departments-math.md`) is the first full subject
page: teaching approach, cross-subject connections, a curriculum comparison,
three sample PDF downloads per school division, and student/teacher highlights.
All subject pages now have draft teaching approaches, curriculum tables, project
prompts, downloadable sample booklets, and student/teacher feature placeholders.
Each department and group page has its own `reviewed: false` frontmatter flag.
Set the CMS field **Department content reviewed** to true (or set `reviewed: true`
in that page) to remove only its **Not reviewed** banner.

The curriculum overview and sample features need school review. Historical
awards retain their original dates. New language/program placeholders do not
assert current availability, schedules, or registration details.

Every department page ends with the shared **Our teachers** carousel. Profiles,
portraits, and clickable highlight articles are editable in CMS > Config >
Teachers (`content/teachers.json`). The four current identities are fictional;
the `placeholder` flag controls their explicit sample label. Replace the names,
portraits, and articles with approved faculty content before turning it off.

The portrait JPGs in `static/img/teachers/` are small exports of images made with
the built-in imagegen tool. Exact generation prompts and asset paths are recorded
in `content/teacher-portrait-prompts.json`.

The sample PDFs are original demonstration activities, labeled on both the
page and each PDF. To regenerate them with Python and ReportLab installed:

```sh
python3 scripts/generate-mathematics-samples.py
python3 scripts/generate-department-resources.py
```

## Summer Camp prototype

The homepage Summer Camp banner links to `/departments/summer-camp/`, also
listed under Enrichment in the Departments menu, directory, and subject strip.
Edit the starter STEM activities, sample camp day, and registration copy in
`content/page/departments-summer-camp/departments-summer-camp.md`. The page uses the existing
department layout and review flag. Camp dates, ages, hours, tuition, and the
registration destination still need confirmation; the current call to action
opens the existing contact page for camp inquiries.

## Our Schools prototype

The **Our Schools** menu replaces **Programs**. Start at `/schools/`, then
explore `/schools/lower-school/`, `/schools/middle-school/`,
`/schools/high-school/`, and `/schools/preschool/`. Content is editable under
`content/page/schools*`; school links live in `content/navigation.yml`.
The compact school banner and sticky division strip follow the Departments
palette. Each division has its own approach, learning, student life, and
admissions sections; High School also compares the three existing track
outlines and connects them to department curriculum columns.

Department tables use **High School** consistently with the new navigation.
Each division column has a stable `curriculum-lower-school`,
`curriculum-middle-school`, or `curriculum-high-school` anchor. Existing PDF
download URLs are preserved, including historical `upper-school` filenames.

All new school pages have `reviewed: false`. The new Lower/Middle division
boundaries, track names and sequences, university arrangements, current
electives, support arrangements, and illustrative weeks require school review.
Set **School or department content reviewed** in the CMS after approval.
The shared admissions pages remain the source for the application process.

Legacy `/programs` school URLs redirect to their `/schools/` equivalents in
Gatsby's browser navigation and Netlify's production redirects. Original image
folders under `content/page/programs*` remain as assets for the new pages.

## Inquiry form integration

The existing Netlify inquiry form can additionally send submissions to Google Apps
Script to save a Google Sheet row, notify admissions and optionally send personalized
applicant replies based on grade and selected interests. Google automation
runs after Netlify accepts the submission and does not block form intake.

See [the inquiry guide](integrations/inquiry-production/README.md) for webhook setup,
Google account migration, recovery and validation. Run `npm test` for mocked backend
checks and `npm run build` for Gatsby.

<!-- AUTO-GENERATED-CONTENT:START (STARTER) -->
<p align="center">
  <a href="https://www.gatsbyjs.org">
    <img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby's blog starter
</h1>

Kick off your project with this blog boilerplate. This starter ships with the main Gatsby configuration files you might need to get up and running blazing fast with the blazing fast app generator for React.

_Have another more specific idea? You may want to check out our vibrant collection of [official and community-created starters](https://www.gatsbyjs.org/docs/gatsby-starters/)._

## 🚀 Quick start

1.  **Create a Gatsby site.**

    Use the Gatsby CLI to create a new site, specifying the blog starter.

    ```shell
    # create a new Gatsby site using the blog starter
    gatsby new my-blog-starter https://github.com/gatsbyjs/gatsby-starter-blog
    ```

1.  **Start developing.**

    Navigate into your new site’s directory and start it up.

    ```shell
    cd my-blog-starter/
    gatsby develop
    ```

1.  **Open the source code and start editing!**

    Your site is now running at `http://localhost:8000`!

    _Note: You'll also see a second link: _`http://localhost:8000/___graphql`_. This is a tool you can use to experiment with querying your data. Learn more about using this tool in the [Gatsby tutorial](https://www.gatsbyjs.org/tutorial/part-five/#introducing-graphiql)._

    Open the `my-blog-starter` directory in your code editor of choice and edit `src/pages/index.js`. Save your changes and the browser will update in real time!

## 🧐 What's inside?

A quick look at the top-level files and directories you'll see in a Gatsby project.

    .
    ├── node_modules
    ├── src
    ├── .gitignore
    ├── .prettierrc
    ├── gatsby-browser.js
    ├── gatsby-config.js
    ├── gatsby-node.js
    ├── gatsby-ssr.js
    ├── LICENSE
    ├── package-lock.json
    ├── package.json
    └── README.md

1.  **`/node_modules`**: This directory contains all of the modules of code that your project depends on (npm packages) are automatically installed.

2.  **`/src`**: This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser) such as your site header or a page template. `src` is a convention for “source code”.

3.  **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for.

4.  **`.prettierrc`**: This is a configuration file for [Prettier](https://prettier.io/). Prettier is a tool to help keep the formatting of your code consistent.

5.  **`gatsby-browser.js`**: This file is where Gatsby expects to find any usage of the [Gatsby browser APIs](https://www.gatsbyjs.org/docs/browser-apis/) (if any). These allow customization/extension of default Gatsby settings affecting the browser.

6.  **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. (Check out the [config docs](https://www.gatsbyjs.org/docs/gatsby-config/) for more detail).

7.  **`gatsby-node.js`**: This file is where Gatsby expects to find any usage of the [Gatsby Node APIs](https://www.gatsbyjs.org/docs/node-apis/) (if any). These allow customization/extension of default Gatsby settings affecting pieces of the site build process.

8.  **`gatsby-ssr.js`**: This file is where Gatsby expects to find any usage of the [Gatsby server-side rendering APIs](https://www.gatsbyjs.org/docs/ssr-apis/) (if any). These allow customization of default Gatsby settings affecting server-side rendering.

9.  **`LICENSE`**: Gatsby is licensed under the MIT license.

10. **`package-lock.json`** (See `package.json` below, first). This is an automatically generated file based on the exact versions of your npm dependencies that were installed for your project. **(You won’t change this file directly).**

11. **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.

12. **`README.md`**: A text file containing useful reference information about your project.

## 🎓 Learning Gatsby

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.org/). Here are some places to start:

- **For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.org/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples, head [to our documentation](https://www.gatsbyjs.org/docs/).** In particular, check out the _Guides_, _API Reference_, and _Advanced Tutorials_ sections in the sidebar.

## 💫 Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/gatsbyjs/gatsby-starter-blog)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/gatsbyjs/gatsby-starter-blog)

## 🖼️ Netlify CDN

This project is deployed on Netlify, which automatically serves all static assets (including images) through their global CDN. This provides:

- **Global CDN delivery**: Images are served from edge locations worldwide for faster loading
- **Automatic caching**: Static assets are cached for optimal performance
- **No configuration needed**: All existing image paths continue to work as-is

### How It Works

- All images in your `/static/img/` folder are automatically served through Netlify's CDN
- No changes to existing image paths are required
- Gatsby's built-in image processing continues to work normally
- The `netlify.toml` file configures caching headers for optimal performance

<!-- AUTO-GENERATED-CONTENT:END -->
