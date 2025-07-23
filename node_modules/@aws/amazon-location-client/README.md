# Amazon Location JavaScript Client

This is a distribution of the [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3) containing the standalone [Maps](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-maps/), [Places](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-places/), and [Routes](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-routes/) SDKs, the [Location SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/location/), our [authentication helper](https://github.com/aws-geospatial/amazon-location-utilities-auth-helper-js), and [credential providers](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/) intended for use in browsers.

## Installation

### Usage with a browser

Add the script to an HTML file for usage directly in the browser.

```html
<script src="https://cdn.jsdelivr.net/npm/@aws/amazon-location-client@1"></script>
```

### Usage with modules

We recommend using [@aws-sdk/client-geo-maps](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-maps/), [@aws-sdk/client-geo-places](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-places/), [@aws-sdk/client-geo-routes](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-routes/), [@aws-sdk/client-location](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/location/) and [@aws-sdk/credential-providers](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/) from the [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3) if possible to get the full benefit of the modularized AWS SDK.

## Usage

All functions are available under the `amazonLocationClient` global.

### API Key

This example uses the Amazon Location Client to make a request that authenticates using an API key.

```html
<!-- Import the Amazon Location Client -->
<script src="https://cdn.jsdelivr.net/npm/@aws/amazon-location-client@1"></script>
```

```javascript
// Create an authentication helper instance using an API key and region
const authHelper = amazonLocationClient.withAPIKey("<API Key>", "<Region>");

const client = new amazonLocationClient.GeoRoutesClient(authHelper.getClientConfig());
const input = { ... };
const command = new amazonLocationClient.routes.CalculateRoutesCommand(input);
const response = await client.send(command);
```

### Cognito

This example uses the Amazon Location Client to make a request that authenticates using Amazon Cognito. For more information on setting up Amazon Cognito identity pools, please refer to this [guide](https://docs.aws.amazon.com/location/latest/developerguide/authenticating-using-cognito.html).

```javascript
// Create an authentication helper instance using credentials from Amazon Cognito
const authHelper = await amazonLocationClient.withIdentityPoolId("<Identity Pool ID>");

const client = new amazonLocationClient.GeoRoutesClient(authHelper.getClientConfig());
const input = { ... };
const command = new amazonLocationClient.routes.CalculateRoutesCommand(input);
const response = await client.send(command);
```

## Documentation

The APIs for the different client SDKs are grouped separately.

### [@aws-sdk/client-geo-maps](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-maps/)

The standalone Maps SDK commands are grouped into a `maps` namespace. For example:

```javascript
// Create an authentication helper instance using an API key and region
const authHelper = amazonLocationClient.withAPIKey("<API Key>", "<Region>");

const client = new amazonLocationClient.GeoMapsClient(authHelper.getClientConfig());
const input = { ... };
const command = new amazonLocationClient.maps.GetStaticMapCommand(input);
const response = await client.send(command);
```

### [@aws-sdk/client-geo-places](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-places/)

The standalone Places SDK commands are grouped into a `places` namespace. For example:

```javascript
// Create an authentication helper instance using an API key and region
const authHelper = amazonLocationClient.withAPIKey("<API Key>", "<Region>");

const client = new amazonLocationClient.GeoPlacesClient(authHelper.getClientConfig());
const input = { ... };
const command = new amazonLocationClient.places.GetPlaceCommand(input);
const response = await client.send(command);
```

### [@aws-sdk/client-geo-routes](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-routes/)

The standalone Routes SDK commands are grouped into a `routes` namespace. For example:

```javascript
// Create an authentication helper instance using an API key and region
const authHelper = amazonLocationClient.withAPIKey("<API Key>", "<Region>");

const client = new amazonLocationClient.GeoRoutesClient(authHelper.getClientConfig());
const input = { ... };
const command = new amazonLocationClient.routes.CalculateRoutesCommand(input);
const response = await client.send(command);
```

### [@aws-sdk/client-location](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/location/)

The Location SDK commands are under the top-level namespace. For example:

```javascript
// Create an authentication helper instance using an API key and region
const authHelper = amazonLocationClient.withAPIKey("<API Key>", "<Region>");

const client = new amazonLocationClient.LocationClient(authHelper.getClientConfig());
const input = { ... };
const command = new amazonLocationClient.ListGeofencesCommand(input);
const response = await client.send(command);
```

Refer to [@aws-sdk/client-geo-maps](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-maps/), [@aws-sdk/client-geo-places](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-places/), [@aws-sdk/client-geo-routes](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/geo-routes/), [@aws-sdk/client-location](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/location/) and [@aws-sdk/credential-providers](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/) for further documentation.

## Getting Help

The best way to interact with our team is through GitHub.
You can [open an issue](https://github.com/aws-geospatial/amazon-location-client-js/issues/new/choose) and choose from one of our templates for
[bug reports](https://github.com/aws-geospatial/amazon-location-client-js/issues/new?assignees=&labels=bug%2C+needs-triage&template=---bug-report.md&title=),
[feature requests](https://github.com/aws-geospatial/amazon-location-client-js/issues/new?assignees=&labels=feature-request&template=---feature-request.md&title=)
or [guidance](https://github.com/aws-geospatial/amazon-location-client-js/issues/new?assignees=&labels=guidance%2C+needs-triage&template=---questions---help.md&title=).
If you have a support plan with [AWS Support](https://aws.amazon.com/premiumsupport/), you can also create a new support case.

Please make sure to check out the following resources before opening an issue:

- Our [Changelog](CHANGELOG.md) for recent changes.

## Contributing

We welcome community contributions and pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to set up a development environment and submit code.

## License

Amazon Location JavaScript Client is distributed under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0),
see LICENSE.txt and NOTICE.txt for more information.
