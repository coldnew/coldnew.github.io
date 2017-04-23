// Compiled by ClojureScript 1.7.228 {}
goog.provide('blog.color_prompt');
goog.require('cljs.core');
goog.require('clojure.string');
blog.color_prompt.span = (function blog$color_prompt$span(x,y){
var pre = "<span style=\"-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;\" onmousedown=\"return false;\" onselectstart=\"return false;\" ondragstart=\"return false\">";
var pos = "</span>";
var extra = "<span style=\"width: 0; height: 0; display: inline-block; overflow: hidden;\"><span style=\"display: block;\"></span></span>";
return [cljs.core.str(pre),cljs.core.str(x),cljs.core.str(pos),cljs.core.str(extra),cljs.core.str(y)].join('');
});
/**
 * Replace line-seqs for every starts. if match to regexp. This function make cljs regexp work as ^regex.
 *   I use this function due to current cljs doesn't support #"(?m)^xxx$" regexp, which work on clojure.
 */
blog.color_prompt.replace_line_starts = (function blog$color_prompt$replace_line_starts(regex,newval,seq){
return cljs.core.map.call(null,(function (p1__8718_SHARP_){
if(clojure.string.starts_with_QMARK_.call(null,p1__8718_SHARP_,clojure.string.join.call(null,cljs.core.rest.call(null,cljs.core.re_find.call(null,regex,p1__8718_SHARP_))))){
return clojure.string.replace.call(null,p1__8718_SHARP_,regex,newval);
} else {
return p1__8718_SHARP_;
}
}),seq);
});
blog.color_prompt.color_shell_prompt = (function blog$color_prompt$color_shell_prompt(classname){
var block = document.getElementsByClassName(classname);
var length = block.length;
var user_highlight = blog.color_prompt.span.call(null,"<font color=\"lightgreen\">$1</font>$2<font color=\"lightblue\">$3</font>","$4");
var root_highlight = blog.color_prompt.span.call(null,"<font color=\"crimson\">$1</font>$2<font color=\"lightblue\">$3</font>","$4");
var i = (0);
while(true){
if((i < length)){
var target_8719 = (block[i]);
target_8719.innerHTML = clojure.string.join.call(null,"\n",blog.color_prompt.replace_line_starts.call(null,/(\w*)(\s*)(.*\#\s)(.*)/,root_highlight,blog.color_prompt.replace_line_starts.call(null,/(\w*@\w*)(\s*)(.*\$\s)(.*)/,user_highlight,blog.color_prompt.replace_line_starts.call(null,/(root@\w*)(\s*)(.*\#\s)(.*)/,root_highlight,clojure.string.split.call(null,target_8719.innerHTML,/\n/)))));

var G__8720 = (i + (1));
i = G__8720;
continue;
} else {
return null;
}
break;
}
});
blog.color_prompt.color_clojure_prompt = (function blog$color_prompt$color_clojure_prompt(classname){
var block = document.getElementsByClassName(classname);
var length = block.length;
var prompt_highlight = blog.color_prompt.span.call(null,"<font color=\"#FFFF75\">$1</font>","$2");
var i = (0);
while(true){
if((i < length)){
var target_8721 = (block[i]);
target_8721.innerHTML = clojure.string.join.call(null,"\n",blog.color_prompt.replace_line_starts.call(null,/(\s\s#_=>\s)(.*)/,"$1$2",blog.color_prompt.replace_line_starts.call(null,/(\s\s#_=&gt;\s)(.*)/,"$1$2",blog.color_prompt.replace_line_starts.call(null,/(user=>\s)(.*)/,"$1$2",blog.color_prompt.replace_line_starts.call(null,/(user=&gt;\s)(.*)/,"$1$2",blog.color_prompt.replace_line_starts.call(null,/(user>\s*)(.*)/,prompt_highlight,blog.color_prompt.replace_line_starts.call(null,/(user&gt;\s*)(.*)/,prompt_highlight,clojure.string.split.call(null,target_8721.innerHTML,/\n/))))))));

var G__8722 = (i + (1));
i = G__8722;
continue;
} else {
return null;
}
break;
}
});
blog.color_prompt.color_prompt = (function blog$color_prompt$color_prompt(){
blog.color_prompt.color_shell_prompt.call(null,"example");

blog.color_prompt.color_shell_prompt.call(null,"src src-sh");

blog.color_prompt.color_clojure_prompt.call(null,"example");

return blog.color_prompt.color_clojure_prompt.call(null,"src src-clojure");
});

//# sourceMappingURL=color_prompt.js.map