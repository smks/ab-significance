# AB Significance jQuery plugin

> jQuery plugin that calculates the Significance, Z Score, P Value, Conversion rate and overall result of Control and Treatments for AB Testing

## Getting Started

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/ab-significance.min.js"></script>
<script>
  jQuery(function ($) {
      var options = {
          resultType: 'all',
          control: {
              'label': 'Control A',
              'hits': 600,
              'conversions': 100
          },
          treatment: {
              'label': 'Treatment A',
              'hits': 700,
              'conversions': 150
          },
          conversionRateOptions: {
              'percentage': true,
              'decimalPlaces': 2
          },
          confidenceOptions: {
              'percentage': false,
              'decimalPlaces': false,
              'targetValue': 95,
              'timesHundred': false
          }
      };
      
      const HITS = 'hits';
      const CONVERSIONS = 'conversions';
      const CONFIDENCE = 'confidence';
      const CONVERSION_RATES = 'conversionRates';
      const Z_SCORE = 'zScore';
      const P_VALUE = 'pValue';
      const SIGNIFICANT = 'significant';
      const ALL = 'all'; // default
      
      // returns array of labels : hits
      options.resultType = HITS;
      console.log($.abSignificance(options));
      // outputs: Object {Control A: 600, Treatment A: 700}
      
      // returns array of labels : conversions
      options.resultType = CONVERSIONS;
      console.log($.abSignificance(options));
      // outputs: Object {Control A: 100, Treatment A: 150}
      
      // returns confidence
      options.resultType = CONFIDENCE;
      console.log($.abSignificance(options));
      // outputs: 0.9858041503343136
      
      // returns conversion rates
      options.resultType = CONVERSION_RATES;
      console.log($.abSignificance(options));
      // outputs: Object {Control A: "16.67%", Treatment A: "21.43%"}
      
      // returns Z Score
      options.resultType = Z_SCORE;
      console.log($.abSignificance(options));
      // outputs: 2.1918297870204775
      
      // returns P Value
      options.resultType = P_VALUE;
      console.log($.abSignificance(options));
      // outputs: 8.16496580927726
      
      // returns true/false
      options.resultType = SIGNIFICANT;
      console.log($.abSignificance(options));
      // outputs: 0.014195849665686433
      
      // returns object of all
      options.resultType = ALL;
      console.log($.abSignificance(options));
      // outputs: true (is significant)
  });
</script>
```

## License

MIT © Shaun Michael K. Stone
