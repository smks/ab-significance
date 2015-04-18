# AB Significance jQuery plugin

> Determine the confidence, z-value and significance of control and treatment


## Getting Started

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/ab-significance.min.js"></script>
<script>
  jQuery(function ($) {
  
        var result = $.abSignificance(
            {
                resultType: 'all',
                control: {
                    'label': 'Control A',
                    'hits': 16,
                    'conversions': 4
                },
                treatment: {
                    'label': 'Treatment A',
                    'hits': 16,
                    'conversions': 16
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
