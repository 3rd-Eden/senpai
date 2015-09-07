# Notice Me Senpai!

Senpai is a gracefully degrading wrapper around the Notification API. It allows
you to write the same code in every browser and those who support the
Notification API, will receive a notification while other receive nothing. It
also automatically handles the permission handling for you.

## Installation

The module is written against a commonjs module system and is published to the
public npm registry. You can install it by simply running:

```
npm install --save senpai
```

## Usage

Lets get down to the nitty gritty, the API. In all examples we assume that
you've already required the library as followed:

```js
'use strict';

var Notice = require('senpai');
```

The `Notice` constructor allows 2 arguments: 

1. The title of the notification.
2. An options object that can configure the following the properties:
  - `silent` Does the notification need to be silent of sound and vibration,
    defaults to `true`
  - `timeout` How long should the notification be presented at the user. You
    usually only want to flash the user with notification instead of spamming
    them. Default `0` (disabled)

The `options` argument also allows all values that you can specify for
a Notification like `body` and `icon`.

To create a new notification you simply construct a new instance:

```js
var notify = new Notice('Notice me', {
  body: 'senpai!'
});
```

This should trigger a notification in the browser after you've accepted the
request for permission. To destroy/close the notification you can invoke the
`destory` method:

```js
notify.destroy();
```

### Events

You can subscribe to various of actions that take place in the life cycle of
a notification. These events are emitted on the returned instance using the
EventEmitter API. So you can subscribe to closing of the notification using:

```js
notify.on('close', function () {
  console.log('The notification was closed');
});
```

The following events are emitted:

- `timeout` The notification has timed out, we're going to close it. This is
  only emitted if you've set the `timeout` value in the constructor.
- `close` The notification has been closed, if the first argument received in
  this event is an error then it was closed due to an error.
- `seen` The user has clicked the notification.
- `error` Something odd has happened, this will cause the notification to close
  automatically.

## License

MIT
