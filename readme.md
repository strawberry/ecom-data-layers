# Usage

## Registering Event Listeners

You can register event listeners using an array of objects when initialising the TagManager library:

```json
[
  {
    "event": "gtmEventName",
    "listener": "event:fired",
    "dataSource": "event"
  },
  {
    "event": "gtmEventName2",
    "listener": "product:viewed",
    "dataSource": "[data-gtm-product]"
  }
]
```

| Option   | Description |
| ----- | --- |
| `event` | The name of the event in Google Tag Manager.
| `listener` | The event to listen for on the page. For example, you may fire a `cart:added` event when a product is added to the cart. |
| `dataSource` | Where the data for the dataLayer is going to come from. Use `"event"` to get the data from the event's detail, or you can use a selector to get the data from a |

### Using the event data source

Use the event data source to get the data to be pushed to the datalayer from the event itself.

For example, let's say you fire this CustomEvent:

```javascript
dispatch(new CustomEvent('cart:added', {
    detail: {
        productId: 12345,
        title: 'Plain White Tee',
        price: 1699
    }
}));
```

The data pushed to the data layer would be

```json
{
  "productId": 12345,
  "title": "Plain White Tee",
  "price": 1699
}
```

### Using the event data source with a callback

If you want to use an event's detail as a data source, but the detail from the event isn't quite in the format you need
it, you can specify a callback to manipulate the data before it's pushed to the data layer.

Using the example from above, you could do the following to manipulate the price:

```javascript
{
    "event": "addToCart",
    "listener": "cart:added",
    "dataSource": data => {
        ...data,
        price: Number(data.price / 100).toFixed(2) // "16.99"
    }
}
```

### Using a selector as a data source

If the data you'll be pushing to the data layer is static, you can instead pass a selector as a `dataSource` value.

Consider this event listener:

```json
{
  "event": "pageView",
  "listener": "DOMContentLoaded",
  "dataSource": "[data-gtm-page]"
}
```

In the template, you can set up the data layer object within a JSON script tag:

```html

<script data-gtm-page type="application/json">
    {
        title: "Meet the Team",
        page_language: "en",
        logged_in_status: true,
        customer_id: 1
    }
</script>
```

## Initialise the TagManager

```typescript
// Example
new TagManager([
    {
        event: "searchOpen",
        listener: "search:opened",
        dataSource: "event",
    },
    {
        event: "productView",
        listener: "pdp:viewed",
        dataSource: "[data-gtm-product]"
    }
]);
```
