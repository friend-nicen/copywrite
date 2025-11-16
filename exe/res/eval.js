window.__VERSION__ = "1.5";

//禁止超链接默认开新窗口
window.addEventListener('load',function(){ 
	let base = document.querySelector('base'); 
	if (base) base.removeAttribute('target');	
});


/* 保存原始的createElement函数 */
const originalCreateElement = document.createElement;

/* 重载createElement函数 */
document.createElement = function(tagName) {
	/* 调用原始的createElement函数来创建元素 */
	const element = originalCreateElement.call(document, tagName);
	// 如果创建的是a标签，则添加点击事件监听器
	if (tagName.toLowerCase() === 'a') {
		element.target = "_self";
		element.addEventListener('click', function() {
		 	this.target = "_self";
		});
	}
	return element;
};

//禁止超链接开新窗口
document.addEventListener('mousedown', function (event) {
	var target = event.target;
	for(var i=1;target && i<=5;i++){
		if ( target.tagName == 'A')  {
			target.removeAttribute('target');
			return;
		}
		target = target.parentNode; 
	} 
}, true);
	
//禁止弹窗函数
window.open =  function(url){ window.location.href = url; } 

document.addEventListener('contextmenu', function(e) {
	e.preventDefault();
});
