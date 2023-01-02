# URL Query Parsing

Currently we use the internal Query Parser from express which is well known.
The only change is how dots are handled, the `allowDots` option is enabled.

    app.set('query parser', (querystring) => {
        return qs.parse(querystring, { allowDots: true });
    });

Further info: https://www.npmjs.com/package/qs

Currently the implementation __is not checking invalid fields or options for known fields__. It
is lenient and in case fields are not recognized they will be are ignored.
Only the wrong syntax for the special fields below can throw a server side error, 
in this case is likely to be a HTTP 500 because of the lack of validation as mentioned before.

Below is a list of current supported query parameters and its usage. 

## Selecting

    ?select[name]=Luke&filter[title]=SomeTitle

## Ordering

    ?order[name]=ASC&order[title]=DESC

## Filtering

__NOTE__: Currently the application supports two types for the filtering:

- Strings: Operator `like` is used.
- Booleans: Operator `equal` is used.

### Filtering with different fields (AND operator)

    ?filter[name]=Luke&filter[title]=SomeTitle
    
This is equivalent, with dots:

    ?filter.name=Luke&filter.title=SomeTitle

### Filtering with many values, same field (OR operator)

    ?filter[name]=Luke&filter[name]=Leia

This is equivalent, with dots:

    ?filter.name=Luke&filter.name=Leia

## Pagination with skip and take

If pagination params are not specified the default limit will be applied.
Current limit is 100 entries.

    ?skip=1&take=2

__NOTE__: The `take` field can be used without skip that defaults to Zero in this case. 
Any combination misuse can result in no entries returned instead of an error.
