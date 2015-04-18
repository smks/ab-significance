# AB Significance jQuery plugin

> Determine the confidence, z-value and significance of control and treatment


## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.githubusercontent.com/SMKS/jquery-ab-significance/master/dist/jquery.ab-significance.min.js
[max]: https://raw.githubusercontent.com/SMKS/jquery-ab-significance/master/dist/jquery.ab-significance.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/ab-significance.min.js"></script>
<script>
  jQuery(function ($) {
  
        var result = $.abSignificance(
            {
                resultType: 'significant',
                control: {
                    'label': 'Control A',
                    'hits': 16,
                    'conversions': 4
                },
                treatment: {
                    'label': 'Treatment A',
                    'hits': 16,
                    'conversions': 8
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
            }
        );
  });
  
  });
</script>
```


## License

MIT © Shaun Michael K. Stone
