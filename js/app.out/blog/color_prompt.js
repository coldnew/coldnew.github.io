// Compiled by ClojureScript 1.7.228 {:static-fns true, :optimize-constants true}
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
return cljs.core.map.cljs$core$IFn$_invoke$arity$2((function (p1__12120_SHARP_){
if(clojure.string.starts_with_QMARK_(p1__12120_SHARP_,clojure.string.join.cljs$core$IFn$_invoke$arity$1(cljs.core.rest(cljs.core.re_find(regex,p1__12120_SHARP_))))){
return clojure.string.replace(p1__12120_SHARP_,regex,newval);
} else {
return p1__12120_SHARP_;
}
}),seq);
});
blog.color_prompt.color_shell_prompt = (function blog$color_prompt$color_shell_prompt(classname){
var block = document.getElementsByClassName(classname);
var length = block.length;
var user_highlight = blog.color_prompt.span("<font color=\"lightgreen\">$1</font>$2<font color=\"lightblue\">$3</font>","$4");
var root_highlight = blog.color_prompt.span("<font color=\"crimson\">$1</font>$2<font color=\"lightblue\">$3</font>","$4");
var i = (0);
while(true){
if((i < length)){
var target_12121 = (block[i]);
target_12121.innerHTML = clojure.string.join.cljs$core$IFn$_invoke$arity$2("\n",blog.color_prompt.replace_line_starts(/(\w*)(\s*)(.*\#\s)(.*)/,root_highlight,blog.color_prompt.replace_line_starts(/(\w*@\w*)(\s*)(.*\$\s)(.*)/,user_highlight,blog.color_prompt.replace_line_starts(/(root@\w*)(\s*)(.*\#\s)(.*)/,root_highlight,clojure.string.split.cljs$core$IFn$_invoke$arity$2(target_12121.innerHTML,/\n/)))));

var G__12122 = (i + (1));
i = G__12122;
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
var prompt_highlight = blog.color_prompt.span("<font color=\"#FFFF75\">$1</font>","$2");
var i = (0);
while(true){
if((i < length)){
var target_12123 = (block[i]);
target_12123.innerHTML = clojure.string.join.cljs$core$IFn$_invoke$arity$2("\n",blog.color_prompt.replace_line_starts(/(\s\s#_=>\s)(.*)/,"$1$2",blog.color_prompt.replace_line_starts(/(\s\s#_=&gt;\s)(.*)/,"$1$2",blog.color_prompt.replace_line_starts(/(user=>\s)(.*)/,"$1$2",blog.color_prompt.replace_line_starts(/(user=&gt;\s)(.*)/,"$1$2",blog.color_prompt.replace_line_starts(/(user>\s*)(.*)/,prompt_highlight,blog.color_prompt.replace_line_starts(/(user&gt;\s*)(.*)/,prompt_highlight,clojure.string.split.cljs$core$IFn$_invoke$arity$2(target_12123.innerHTML,/\n/))))))));

var G__12124 = (i + (1));
i = G__12124;
continue;
} else {
return null;
}
break;
}
});
blog.color_prompt.color_prompt = (function blog$color_prompt$color_prompt(){
blog.color_prompt.color_shell_prompt("example");

blog.color_prompt.color_shell_prompt("src src-sh");

blog.color_prompt.color_clojure_prompt("example");

return blog.color_prompt.color_clojure_prompt("src src-clojure");
});
