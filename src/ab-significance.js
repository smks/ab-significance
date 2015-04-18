/*
 *
 *
 *
 * Copyright (c) 2015 Shaun Michael K. Stone
 * Licensed under the MIT license.
 */
(function ($) {

    $.abSignificance = function (options) {
        // Override default options with passed-in options.
        options = $.extend({}, $.abSignificance.options, options);

        // Default options.
        $.abSignificance.options = {
            resultType: 'significant',
            control: {
                'label': 'Control',
                'hits': 100,
                'conversions': 50
            },
            treatment: {
                'label': 'Treatment A',
                'hits': 100,
                'conversions': 20
            },
            conversionRateOptions: {
                'percentage': true,
                'decimalPoint': 2
            },
            confidenceOptions: {
                'percentage': true,
                'decimalPoint': 2,
                'targetValue': 95
            },
            debugMode: false,
            sampleSize: [20, 40]
        };

        // ensure converted to base 10 integers
        options.control.hits = parseInt(options.control.hits, 10);
        options.control.conversions = parseInt(options.control.conversions, 10);
        options.treatment.conversions = parseInt(options.treatment.conversions, 10);
        options.treatment.conversions = parseInt(options.treatment.conversions, 10);

        // return result based on result type option
        switch (options.result) {

            case 'confidence':
                return $.abSignificance.calculateConfidence(
                    options.control,
                    options.treatment,
                    options.confidenceOptions.percentage,
                    options.confidenceOptions.decimalPoint
                );
                break;

            case 'conversionRates':
                return $.abSignificance.calculateConversionRate(
                    options.conversionRateOptions.percentage,
                    options.conversionRateOptions.decimalPoint
                );
                break;

            case 'zScore':
                return $.abSignificance.calcZScore(
                    options.control,
                    options.treatment
                );
                break;

            case 'pValue':
                return $.abSignificance.calcPValue(
                    options.control,
                    options.treatment
                );
                break;

            case 'significant':
                return $.abSignificance.calcSignificance(
                    options.confidenceOptions.targetValue,
                    options.control,
                    options.treatment,
                    false,
                    false
                );
                break;

            case 'all':
                return $.abSignificance.calculateResults(
                    options.confidenceOptions.targetValue,
                    options.control,
                    options.treatment,
                    options.confidenceOptions.percentage,
                    options.confidenceOptions.decimalPoint
                );
                break;

            default:
                throw new Error('AB Significance: return result not specified or does not exist');
        }
    };

    $.abSignificance.calculateResults = function (control, treatment, percentage, decimalPoint) {
        var results = {};
        results.conversionRates = $.abSignificance.calculateConversionRate(percentage, decimalPoint);
        results.zScore = $.abSignificance.calcZScore(control, treatment);
        results.confidence = $.abSignificance.calculateConfidence(control, treatment, false, false);
        results.pValue = $.abSignificance.getPValue(results.confidence);
        results.significant = $.abSignificance.isSignificant(results.confidence);
        return results;
    };

    /**
     *
     * @param percentage
     * @param decimalPoint
     */
    $.abSignificance.calculateConfidence = function (controlObj, treatmentObj, percentage, decimalPoint, timesHundred) {

        timesHundred = timesHundred || false;

        var zScore = $.abSignificance.calcZScore(controlObj, treatmentObj);
        var confidence = $.abSignificance.cumNorDist(zScore);

        if (decimalPoint === true) {
            confidence.toFixed(decimalPoint);
        }

        if (timesHundred === true) {
            confidence = confidence * 100;
        }

        if (percentage === true) {
            confidence + '%';
        }

        return confidence;
    };

    /**
     * Returns an array of the conversion rate for both control and treatment
     *
     * @param percentage
     * @param decimalPoint
     * @returns {Array}
     */
    $.abSignificance.calculateConversionRate = function (percentage, decimalPoint) {
        var result = [];
        result[$.abSignificance.options.control.label] = $.abSignificance.getControlConversionRate(percentage, decimalPoint);
        result[$.abSignificance.options.treatment.label] = $.abSignificance.getTreatmentConversionRate(percentage, decimalPoint);
        return result;
    };

    /**
     *
     * @returns {*}
     */
    $.abSignificance.getControlConversionRate = function (percentage, decimalPoint) {
        return $.abSignificance.calculateConversionRate(
            $.abSignificance.options.control, percentage, decimalPoint
        );
    };

    /**
     *
     * @returns {*}
     */
    $.abSignificance.getTreatmentConversionRate = function (percentage, decimalPoint) {
        return $.abSignificance.calculateConversionRate(
            $.abSignificance.options.treatment, percentage, decimalPoint
        );
    };

    /**
     *
     * @returns {*}
     * @param target {}
     */
    $.abSignificance.calculateConversionRate = function (target, percentage, decimalPoint) {
        var result;
        percentage = percentage || false;
        decimalPoint = decimalPoint || false;
        if (target.hits === 0 || target.conversions === 0) {
            result = 0;
        } else {
            result = (target.conversions / target.hits) * 100;
        }
        if (decimalPoint) {
            result.toFixed(decimalPoint);
        }
        if (percentage) {
            result += percentage;
        }
        return result;
    };

    /**
     * Calculate the Cumulative Normal Distribution
     *
     * @param zScore
     * @returns {number}
     */
    $.abSignificance.cumNorDist = function (zScore) {
        var b1 = 0.319381530;
        var b2 = -0.356563782;
        var b3 = 1.781477937;
        var b4 = -1.821255978;
        var b5 = 1.330274429;
        var p = 0.2316419;
        var c = 0.39894228;
        var t;

        if (zScore >= 0.0) {
            t = 1.0 / ( 1.0 + p * zScore );
            return (1.0 - c * Math.exp(-zScore * zScore / 2.0) * t *
            ( t * ( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 ));
        } else {
            t = 1.0 / ( 1.0 - p * zScore );
            return ( c * Math.exp(-zScore * zScore / 2.0) * t *
            ( t * ( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 ));
        }
    };

    /**
     * Given a conversion rate, calculate a recommended sample size
     *
     * E.g: 0.25 worst, 0.15, 0.05 best at a 95% confidence
     *
     * @param conv
     * @returns {Array}
     */
    $.abSignificance.calcSampleSize = function (conv) {
        var a = 3.84145882689;
        var res = [];
        var bs = [0.0625, 0.0225, 0.0025];
        var len = bs.length;
        for (var i = 0; i < len; i++) {
            res.push(((1 - conv) * a / (bs[i] * conv)));
        }
        return res;
    }

    /**
     * Calculation of score
     *
     * @param c
     * @param t
     */
    $.abSignificance.calcZScore = function (c, t) {
        var z = $.abSignificance.cr(t) - $.abSignificance.cr(c);
        var s = ($.abSignificance.cr(t) * (1 - $.abSignificance.cr(t))) / t.hits +
            ($.abSignificance.cr(c) * (1 - $.abSignificance.cr(c))) / c.hits;
        return z / Math.sqrt(s);
    }

    /**
     *
     * @param control
     * @param treatment
     * @returns {number}
     */
    $.abSignificance.calcPValue = function (control, treatment) {

        var confidence;

        if (confidence !== undefined) {
            confidence = $.abSignificance.calculateConfidence(control, treatment);
        }

        return $.abSignificance.getPValue(confidence);
    };

    /**
     *
     * @param confidence
     * @returns {number}
     */
    $.abSignificance.getPValue = function (confidence) {
        return 1 - confidence;
    };

    /**
     * Returns true if comparison is significant
     *
     * @param controlObj
     * @param treatmentObj
     * @param percentage
     * @param decimalPoint
     * @returns {boolean}
     */
    $.abSignificance.calcSignificance = function (targetValue, controlObj, treatmentObj, percentage, decimalPoint) {
        var confidence = $.abSignificance.calculateConfidence(controlObj, treatmentObj, percentage, decimalPoint);
        return $.abSignificance.isSignificant(confidence);
    };

    $.abSignificance.isSignificant = function (confidence) {
        if (confidence >= $.abSignificance.options.confidenceOptions.targetValue) {
            return true;
        }

        return false;
    }

    /**
     * Calculation of conversion rate
     * @param t {}
     * @returns {number}
     */
    $.abSignificance.cr = function (t) {
        return t.conversions / t.hits;
    }

}(jQuery));
