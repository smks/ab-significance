(function ($) {
    module('jQuery.abSignificance');

    test('is abSignificance', function () {
        expect(1);
        strictEqual($.abSignificance({punctuation: '!'}), 'abSignificance!', 'should be thoroughly abSignificance');
    });

    test('Control exists', function () {
        expect(1);
        strictEqual($.abSignificance({punctuation: '!'}), 'abSignificance!', 'should be thoroughly abSignificance');
    });

}(jQuery));
