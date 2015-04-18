(function ($) {
    module('jQuery.abSignificance');

    var fixture = {
        resultType: 'conversions',
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
    };

    var hitsFixture = jQuery.extend({}, fixture);
    hitsFixture.resultType = 'hits';

    var confidenceFixture = jQuery.extend({}, fixture);
    confidenceFixture.resultType = 'confidence';

    test('AB Significance - Test Suite', function () {

        /* _________________________________________________________________________________ */

        /*****************************************************
         * Hits Tests
         ****************************************************/
        fixture.resultType = 'hits';
        var hits = $.abSignificance(fixture);
        // we are returning a confidence value
        propEqual(hits, {
            'Control A': 16,
            'Treatment A': 16
        }, 'Hits - should return hits array');

        /*****************************************************
         * End of Hits Tests
         ****************************************************/

        /* _________________________________________________________________________________ */

        /*****************************************************
         *  Conversions Tests
         ****************************************************/

        fixture.resultType = 'conversions';
        var conversions = $.abSignificance(fixture);
        propEqual(conversions, {
            'Control A': 4,
            'Treatment A': 8
        }, 'Conversions - should return conversions array');

        /*****************************************************
         * End of Conversions Tests
         ****************************************************/

        /* _________________________________________________________________________________ */

        /*****************************************************
         * Confidence Tests
         ****************************************************/

            // we are returning a confidence value
        strictEqual($.abSignificance(confidenceFixture),
            0.9347149669381035, 'Confidence - should return confidence value'
        );

        // we are returning confidence times hundred
        confidenceFixture.confidenceOptions.timesHundred = true;
        strictEqual($.abSignificance(confidenceFixture),
            93.47149669381035, 'Confidence - should return confidence times hundred'
        );

        // we are returning confidence times hundred with percentage
        confidenceFixture.confidenceOptions.percentage = true;
        strictEqual($.abSignificance(confidenceFixture),
            '93.47149669381035%', 'Confidence - should return confidence times hundred with percentage'
        );

        // check decimal place is 2 without percentage
        confidenceFixture.confidenceOptions.decimalPlaces = 2;
        confidenceFixture.confidenceOptions.percentage = false;
        equal($.abSignificance(confidenceFixture),
            '93.47', 'Confidence - should return to 2 decimal places without percentage'
        );

        // check decimal place is 2 with percentage
        confidenceFixture.confidenceOptions.percentage = true;
        equal($.abSignificance(confidenceFixture),
            '93.47%', 'Confidence - should return to 2 decimal places with percentage'
        );

        /*****************************************************
         * End of Confidence Tests
         ****************************************************/

        /* _________________________________________________________________________________ */

        /*****************************************************
         * Conversion Rate Tests
         ****************************************************/

        fixture.resultType = 'conversionRates';
        fixture.conversionRateOptions.decimalPlaces = false;
        fixture.conversionRateOptions.percentage = false;
        fixture.control.hits = 100;
        fixture.control.conversions = 50;
        fixture.treatment.hits = 100;
        fixture.treatment.conversions = 75;

        // Test without decimal place and percentage
        propEqual($.abSignificance(fixture), {
            'Control A': 50,
            'Treatment A': 75
        }, 'Conversion Rates - should return correct conversion rate without decimal and percentage');

        // Test without decimal place and with percentage
        fixture.conversionRateOptions.percentage = true;
        propEqual($.abSignificance(fixture), {
            'Control A': '50%',
            'Treatment A': '75%'
        }, 'Conversion Rates - should return correct conversion rate without decimal place and with percentage');

        // Test with decimal place and percentage
        fixture.conversionRateOptions.percentage = true;
        fixture.conversionRateOptions.decimalPlaces = 2;
        propEqual($.abSignificance(fixture), {
            'Control A': '50.00%',
            'Treatment A': '75.00%'
        }, 'Conversion Rates - should return correct conversion rate with decimal and percentage');

        /*****************************************************
         * End of Conversion Rate Tests
         ****************************************************/

        /* _________________________________________________________________________________ */

        /*****************************************************
         *  zScore Tests
         ****************************************************/

        fixture.resultType = 'zScore';
        var zScore = $.abSignificance(fixture);
        equal(zScore, 3.7796447300922718, 'Z-Score - should return correct Z-Score');

        /*****************************************************
         * End of zScore Tests
         ****************************************************/

        /* _________________________________________________________________________________ */

        /*****************************************************
         *  pValue Tests
         ****************************************************/

        fixture.resultType = 'pValue';
        fixture.control.hits = 600;
        fixture.control.conversions = 100;
        fixture.treatment.hits = 700;
        fixture.treatment.conversions = 150;
        var pValue = $.abSignificance(fixture);
        equal(pValue, 0.014195849665686433, 'P Value - should return correct P Value');

        /*****************************************************
         * End of pValue Tests
         ****************************************************/

        /* _________________________________________________________________________________ */

        /* _________________________________________________________________________________ */

        /*****************************************************
         *  Is Significant Tests
         ****************************************************/

        fixture.resultType = 'significant';

        // Pass in significant results and test true
        equal($.abSignificance(fixture), true,
            "Should (if over targetValue) e.g. '95' then return true"
        );

        fixture.control.hits = 600;
        fixture.control.conversions = 500;
        fixture.treatment.hits = 600;
        fixture.treatment.conversions = 500;

        // Pass in insignificant results and test false
        QUnit.equal($.abSignificance(fixture), false,
            "Should (if under targetValue) e.g. '95' then return false"
        );

        /*****************************************************
         * End of Significant Tests
         ****************************************************/

        /* _________________________________________________________________________________ */

        /*****************************************************
         *  Full Results Tests
         ****************************************************/

        fixture.resultType = 'all';
        fixture = $.abSignificance.options;

        fixture.control.hits = 100;
        fixture.control.conversions = 50;
        fixture.treatment.hits = 100;
        fixture.treatment.conversions = 50;

        fixture.conversionRateOptions.decimalPlaces = 2;
        fixture.conversionRateOptions.percentage = true;

        // Pass in significant results and test true
        propEqual($.abSignificance(fixture), {
                'confidence': 0.50000000102793,
                'confidencePercentage': '50.00%',
                'conversionRates': {
                    'Control A': '50.00%',
                    'Treatment A': '50.00%'
                },
                'pValue': 0.49999999897207004,
                'significant': false,
                'zScore': 0
            },
            "When testing AB we should get back the correct results"
        );

        /*****************************************************
         * End of Significant Tests
         ****************************************************/

        /* _________________________________________________________________________________ */
    });

}(jQuery));
