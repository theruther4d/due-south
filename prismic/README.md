# Prismic static

An npm module with helpers for using prismic.io javascript API with javascript-based static-site generators.

## Helpers
### getAllDocuments( callback )
Fetches all document from a repository given the API key

** Arguments **
* callback (function) - the callback function to be executed when the fetch has been completed.

** Returns **
* ( object ) - with keys `collections` and `tags`. Each of the values is itself an object containing keys for each respective `collection` and `tag` type. The value of each of these keys is an array of prismic documents. Ex:
```javascript
    {
        collections: {
            posts: [documents],
            pages: [documents],
            projects: [documents]
        },
        tags: {
            design: [documents],
            development: [documents],
            css: [documents]
        }
    }
```

### getDocumentsByType( type, callback )
Fetches all documents of a specified type from the repository.

** Arguments **
* type ( string ) - the custom-type name that you'd like to fetch.
* callback ( function ) - the callback function to be executed when the fetch has been completed.

** Returns **
* ( object ) - with keys for document type and corresponding values as an array of prismic documents. Ex:
```javascript
    {
        posts: [documents],
        pages: [documents],
        projects: [documents]
    }
```

### getTaggedDocuments( type, callback )
Fetches all tagged documents for a specified type and sorts by tag name.

** Arguments **
* type ( string ) - the custom-type name that you'd like to fetch.
* callback ( function ) - the callback function to be executed when the fetch has been completed.

** Returns **
* ( object ) - with keys for each tag name and corresponding values as an array of prismic documents. Ex:
```javascript
    {
        design: [documents],
        development: [documents],
        css: [documents]
    }
```
