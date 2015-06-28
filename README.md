# metalsmith-prismic-gub
Giving Hubs: Responsive micro-sites created with gulp, metalsmith and prismic.io

## Get Started


#### Install Dependencies

Install gulp globally if you don't have it already:

```
npm install -g gulp
```

Still in terminal:

```
git clone https://github.com/everydayhero/metalsmith-prismic-gub.git
cd metalsmith-prismic-gub
npm install
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

- Run `gulp` in terminal.
- Open `http://localhost:3000` in your browser.


#### Publish to S3

- Add a file named `aws.json` to the project root directory. Insert credentials/info based on the following:

  ```json
    {
      "key": "YOUR_AWS_KEY",
      "secret": "YOUR_AWS_SECRET",
      "bucket": "YOUR_BUCKET_NAME",
      "region": "YOUR_BUCKET_REGION"
    }
  ```
- Run `gulp publish`


---

## TODO

- Organise scss files better
- Potentially get multi-page set up working
- Style blockquotes
