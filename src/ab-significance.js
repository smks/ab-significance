/*
 *
 *
 *
 * Copyright (c) 2015 Shaun Michael K. Stone
 * Licensed under the MIT license.
 */
(function ($) {
    "use strict";

    $.abSignificance = function (options) {

        // Default options.
        $.abSignificance.options = {
            control: {
                'label': 'Control A',
                'hits': 100,
                'conversions': 50
            },
            treatment: {
                'label': 'Treatment A',
                'hits': 100,
                'conversions': 20
            },
            resultType: 'all',
            conversionRateOptions: {
                'percentage': true,
                'decimalPlaces': 2
            },
            confidenceOptions: {
                'percentage': false,
                'decimalPlaces': false,
                'targetValue': 95,
                'timesHundred': true
            }
        };

        // Override default options with passed-in options.
        options = $.extend({}, $.abSignificance.options, options);

        // ensure converted to base 10 integers
        options.control.hits = parseInt(options.control.hits, 10);
        options.control.conversions = parseInt(options.control.conversions, 10);
        options.treatment.hits = parseInt(options.treatment.hits, 10);
        options.treatment.conversions = parseInt(options.treatment.conversions, 10);

        // return result based on result type option
        switch (options.resultType) {
            case 'hits':
                return $.abSignificance.getHits(
                    options.control,
                    options.treatment
                );

            case 'conversions':
                return $.abSignificance.getConversions(
                    options.control,
                    options.treatment
                );

            case 'confidence':
                return $.abSignificance.calculateConfidence(
                    options.control,
                    options.treatment,
                    options.confidenceOptions.percentage,
                    options.confidenceOptions.decimalPlaces,
                    options.confidenceOptions.timesHundred
                );

            case 'conversionRates':
                return $.abSignificance.getConversionRates(
                    options.control,
                    options.treatment,
                    options.conversionRateOptions.percentage,
                    options.conversionRateOptions.decimalPlaces
                );

            case 'zScore':
                return $.abSignificance.calcZScore(
                    options.control,
                    options.treatment
                );

            case 'pValue':
                return $.abSignificance.calcPValue(
                    options.control,
                    options.treatment
                );

            case 'significant':
                return $.abSignificance.calcSignificance(
                    options.confidenceOptions.targetValue,
                    options.control,
                    options.treatment,
                    false,
                    false
                );

            default:
                return $.abSignificance.calculateResults(
                    options.control,
                    options.treatment,
                    options.conversionRateOptions.percentage,
                    options.conversionRateOptions.decimalPlaces
                );
        }
    };

    $.abSignificance.calculateResults = function (control, treatment, percentage, decimalPlaces) {
        var results = {};
        results.conversionRates = $.abSignificance.getConversionRates(control, treatment, percentage, decimalPlaces);
        results.zScore = $.abSignificance.calcZScore(control, treatment);
        results.confidence = $.abSignificance.calculateConfidence(control, treatment, false, false);
        results.confidencePercentage = ((results.confidence * 100).toFixed(2) + '%');
        results.pValue = $.abSignificance.getPValue(results.confidence);
        results.significant = $.abSignificance.isSignificant(results.confidence);
        return results;
    };

    /**
     *
     * @param percentage
     * @param decimalPlaces
     */
    $.abSignificance.calculateConfidence = function (controlObj, treatmentObj, percentage, decimalPlaces, timesHundred) {

        timesHundred = timesHundred || false;

        var zScore = $.abSignificance.calcZScore(controlObj, treatmentObj);
        var confidence = $.abSignificance.cumNorDist(zScore);

        if (timesHundred === true) {
            confidence = confidence * 100;
        }

        if (decimalPlaces) {
            confidence = confidence.toFixed(decimalPlaces);
        }

        if (percentage === true) {
            confidence += '%';
        }

        return confidence;
    };

    $.abSignificance.getConversionRates = function (control, treatment, percentage, decimalPlaces) {
        var result = {};
        result[control.label] = $.abSignificance.calculateConversionRate(control, percentage, decimalPlaces);
        result[treatment.label] = $.abSignificance.calculateConversionRate(treatment, percentage, decimalPlaces);
        return result;
    };

    /**
     *
     * @returns {*}
     */
    $.abSignificance.getControlConversionRate = function (percentage, decimalPlaces) {
        return $.abSignificance.calculateConversionRate(
            $.abSignificance.options.control, percentage, decimalPlaces
        );
    };

    /**
     *
     * @returns {*}
     */
    $.abSignificance.getTreatmentConversionRate = function (percentage, decimalPlaces) {
        return $.abSignificance.calculateConversionRate(
            $.abSignificance.options.treatment, percentage, decimalPlaces
        );
    };

    /**
     *
     * @returns {*}
     * @param target {}
     */
    $.abSignificance.calculateConversionRate = function (target, percentage, decimalPlaces) {
        var result;
        percentage = percentage || false;
        decimalPlaces = decimalPlaces || false;
        if (target.hits === 0 || target.conversions === 0) {
            result = 0;
        } else {
            result = (target.conversions / target.hits) * 100;
        }
        if (decimalPlaces) {
            result = result.toFixed(decimalPlaces);
        }
        if (percentage) {
            result += '%';
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
    };

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
    };

    /**
     *
     * @param control
     * @param treatment
     * @returns {number}
     */
    $.abSignificance.calcPValue = function (control, treatment) {
        var confidence = $.abSignificance.calculateConfidence(control, treatment);
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
     *
     * @param control
     * @param treatment
     * @returns {{}}
     */
    $.abSignificance.getHits = function (control, treatment) {
        var results = {};
        results[control.label] = control.hits;
        results[treatment.label] = treatment.hits;
        return results;
    };

    /**
     *
     * @param control
     * @param treatment
     * @returns {{}}
     */
    $.abSignificance.getConversions = function (control, treatment) {
        var results = {};
        results[control.label] = control.conversions;
        results[treatment.label] = treatment.conversions;
        return results;
    };

    /**
     * Returns true if comparison is significant
     *
     * @param controlObj
     * @param treatmentObj
     * @param percentage
     * @param decimalPlaces
     * @returns {boolean}
     */
    $.abSignificance.calcSignificance = function (targetValue, controlObj, treatmentObj, percentage, decimalPlaces) {
        var confidence = $.abSignificance.calculateConfidence(controlObj, treatmentObj, percentage, decimalPlaces, true);
        return $.abSignificance.isSignificant(confidence);
    };

    $.abSignificance.isSignificant = function (confidence) {
        if (confidence >= $.abSignificance.options.confidenceOptions.targetValue) {
            return true;
        }

        return false;
    };

    /**
     * Calculation of conversion rate
     * @param t {}
     * @returns {number}
     */
    $.abSignificance.cr = function (t) {
        return t.conversions / t.hits;
    };

}(jQuery));