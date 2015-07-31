# metalsmith-prismic-gub

Giving Hubs: Responsive micro-sites created with gulp, metalsmith and prismic.io. Build static sites with tools like Handlebars, SASS and Webpack.

## Dependencies

- [Node.js](https://nodejs.org/) (v0.10+)
- [Gulp.js](http://gulpjs.com/)

## Set up

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository on GitHub.
2. Clone your forked repository to your local machine:

  ```sh
  git clone https://github.com/YOUR-GITHUB-USERNAME/metalsmith-prismic-gub.git
  ```
3. With your terminal/command prompt still open, navigate to your project and install the dependencies (setup may take a few minutes):

  ```sh
  $ cd metalsmith-prismic-gub
  $ npm run setup
  ```

#### Get Prismic

1. Create an account with [Prismic.io](https://prismic.io/). You can register free accounts for testing.

2. Once registered obtain an endpoint URL for your prismic repo (Settings > API & Security).

3. Create a `prismic-config.json` file in your project root directory. It will contain your [metalsmith-prismic](https://github.com/mbanting/metalsmith-prismic) configuration. It should look something like this:

  ```json
    {
      "url": "https://your-prismic-repo.cdn.prismic.io/api"
    }
  ```

#### Run Dev

1. Run the `npm run start` command
2. Open `http://localhost:3000` in your browser.

At this point you should have a running site visible in your browser.


## Publish to S3

1. Add a file named `aws.json` to the project root directory. Insert credentials/info based on the following:

  ```json
    {
      "key": "YOUR_AWS_KEY",
      "secret": "YOUR_AWS_SECRET",
      "bucket": "YOUR_BUCKET_NAME",
      "region": "YOUR_BUCKET_REGION"
    }
  ```
2. Run `gulp publish`

**Note:** Keep your AWS key and secret safe! Make sure this file as added to your .gitignore file before pushing your project up to GitHub.


## Commands

```sh
$ npm run setup    # install project dependencies, run an initial build
$ npm run build    # build production assets
$ npm run start    # run a build and start a local server
$ npm run publish  # publish production assets to Amazon S3
```
