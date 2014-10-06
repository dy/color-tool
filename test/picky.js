describe('Picky tests', function(){
	it('Simple case', function(){
		var a = document.createElement('div');

		a.innerHTML = '<div data-picker></div>';
	});

	it.skip('Pipes', function(){
		var a = Picky();
		a.pipe(writableLikeAnInputOrEtc);
	});
});