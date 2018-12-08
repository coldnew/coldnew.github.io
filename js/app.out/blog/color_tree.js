// Compiled by ClojureScript 1.7.228 {:static-fns true, :optimize-constants true}
goog.provide('blog.color_tree');
goog.require('cljs.core');
goog.require('clojure.string');
/**
 * Replace line-seqs for every starts. if match to regexp. This function make cljs regexp work as ^regex.
 *   I use this function due to current cljs doesn't support #"(?m)^xxx$" regexp, which work on clojure.
 */
blog.color_tree.replace_line_starts = (function blog$color_tree$replace_line_starts(regex,newval,seq){
return cljs.core.map.cljs$core$IFn$_invoke$arity$2((function (p1__12097_SHARP_){
if(clojure.string.starts_with_QMARK_(p1__12097_SHARP_,clojure.string.join.cljs$core$IFn$_invoke$arity$1(cljs.core.rest(cljs.core.re_find(regex,p1__12097_SHARP_))))){
return clojure.string.replace(p1__12097_SHARP_,regex,newval);
} else {
return p1__12097_SHARP_;
}
}),seq);
});
blog.color_tree.tree = (function blog$color_tree$tree(x1,x2,x3,color){
return [cljs.core.str(x1),cljs.core.str("<font color=\""),cljs.core.str(color),cljs.core.str("\">"),cljs.core.str(x2),cljs.core.str("</font>"),cljs.core.str(x3)].join('');
});
blog.color_tree.treeB = (function blog$color_tree$treeB(var_args){
var args12098 = [];
var len__7511__auto___12101 = arguments.length;
var i__7512__auto___12102 = (0);
while(true){
if((i__7512__auto___12102 < len__7511__auto___12101)){
args12098.push((arguments[i__7512__auto___12102]));

var G__12103 = (i__7512__auto___12102 + (1));
i__7512__auto___12102 = G__12103;
continue;
} else {
}
break;
}

var G__12100 = args12098.length;
switch (G__12100) {
case 3:
return blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
case 2:
return blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 1:
return blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
default:
throw (new Error([cljs.core.str("Invalid arity: "),cljs.core.str(args12098.length)].join('')));

}
});

blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$3 = (function (x1,x2,x3){
return blog.color_tree.tree(x1,x2,x3,"lightblue");
});

blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$2 = (function (x1,x2){
return blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$3(x1,x2,"");
});

blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$1 = (function (x2){
return blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$3("",x2,"");
});

blog.color_tree.treeB.cljs$lang$maxFixedArity = 3;
blog.color_tree.treeR = (function blog$color_tree$treeR(var_args){
var args12105 = [];
var len__7511__auto___12108 = arguments.length;
var i__7512__auto___12109 = (0);
while(true){
if((i__7512__auto___12109 < len__7511__auto___12108)){
args12105.push((arguments[i__7512__auto___12109]));

var G__12110 = (i__7512__auto___12109 + (1));
i__7512__auto___12109 = G__12110;
continue;
} else {
}
break;
}

var G__12107 = args12105.length;
switch (G__12107) {
case 3:
return blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
case 2:
return blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 1:
return blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
default:
throw (new Error([cljs.core.str("Invalid arity: "),cljs.core.str(args12105.length)].join('')));

}
});

blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$3 = (function (x1,x2,x3){
return blog.color_tree.tree(x1,x2,x3,"#ff3232");
});

blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$2 = (function (x1,x2){
return blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$3(x1,x2,"");
});

blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$1 = (function (x2){
return blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$3("",x2,"");
});

blog.color_tree.treeR.cljs$lang$maxFixedArity = 3;
blog.color_tree.treeG = (function blog$color_tree$treeG(var_args){
var args12112 = [];
var len__7511__auto___12115 = arguments.length;
var i__7512__auto___12116 = (0);
while(true){
if((i__7512__auto___12116 < len__7511__auto___12115)){
args12112.push((arguments[i__7512__auto___12116]));

var G__12117 = (i__7512__auto___12116 + (1));
i__7512__auto___12116 = G__12117;
continue;
} else {
}
break;
}

var G__12114 = args12112.length;
switch (G__12114) {
case 3:
return blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
case 2:
return blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 1:
return blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
default:
throw (new Error([cljs.core.str("Invalid arity: "),cljs.core.str(args12112.length)].join('')));

}
});

blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$3 = (function (x1,x2,x3){
return blog.color_tree.tree(x1,x2,x3,"lightgreen");
});

blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$2 = (function (x1,x2){
return blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$3(x1,x2,"");
});

blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$1 = (function (x2){
return blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$3("",x2,"");
});

blog.color_tree.treeG.cljs$lang$maxFixedArity = 3;
blog.color_tree.treeLB = (function blog$color_tree$treeLB(x1,x2,x3,x4){
return [cljs.core.str(x1),cljs.core.str("<font color=\"cyan\">"),cljs.core.str(x2),cljs.core.str("</font>"),cljs.core.str(x3),cljs.core.str("<font color=\"lightblue\">"),cljs.core.str(x4),cljs.core.str("</font>")].join('');
});
blog.color_tree.treeLW = (function blog$color_tree$treeLW(x1,x2,x3,x4){
return [cljs.core.str(x1),cljs.core.str("<font color=\"cyan\">"),cljs.core.str(x2),cljs.core.str("</font>"),cljs.core.str(x3),cljs.core.str(x4)].join('');
});
blog.color_tree.color_tree_prompt = (function blog$color_tree$color_tree_prompt(classname){
var block = document.getElementsByClassName(classname);
var length = block.length;
var i = (0);
while(true){
if((i < length)){
var target_12121 = (block[i]);
target_12121.innerHTML = clojure.string.join.cljs$core$IFn$_invoke$arity$2("\n",cljs.core.map.cljs$core$IFn$_invoke$arity$2(((function (i,target_12121,block,length){
return (function (p1__12120_SHARP_){
return clojure.string.replace(p1__12120_SHARP_,/([\w\-\.]*)(&lt;g&gt;)/,"<font color=\"lightgreen\">$1</font>");
});})(i,target_12121,block,length))
,cljs.core.map.cljs$core$IFn$_invoke$arity$2(((function (i,target_12121,block,length){
return (function (p1__12119_SHARP_){
return clojure.string.replace(p1__12119_SHARP_,/(\w*)(&lt;b&gt;)/,"<font color=\"lightblue\">$1</font>");
});})(i,target_12121,block,length))
,blog.color_tree.replace_line_starts(/(│&nbsp;&nbsp;\s*[├──├─└─\s]*\s*)(.*\s*)(-&gt;)(.*\s*)(&lt;lw&gt;)/,blog.color_tree.treeLW("$1","$2","$3","$4"),blog.color_tree.replace_line_starts(/([├──├─└─\s]*\s*)(.*\s*)(-&gt;)(.*\s*)(&lt;lw&gt;)/,blog.color_tree.treeLW("$1","$2","$3","$4"),blog.color_tree.replace_line_starts(/(│&nbsp;&nbsp;\s*[├──├─└─\s]*\s*)(.*\s*)(-&gt;)(.*\s*)(&lt;lb&gt;)/,blog.color_tree.treeLB("$1","$2","$3","$4"),blog.color_tree.replace_line_starts(/([├──├─└─\s]*\s*)(.*\s*)(-&gt;)(.*\s*)(&lt;lb&gt;)/,blog.color_tree.treeLB("$1","$2","$3","$4"),blog.color_tree.replace_line_starts(/([├──├─└─]*\s*)([\w\-\.]*\s*)(&lt;g&gt;)/,blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$2("$1","$2"),blog.color_tree.replace_line_starts(/(│&nbsp;&nbsp;\s│&nbsp;&nbsp;\s[├──├─└─\s]*\s*)([\w\-\.]*\s*)(&lt;g&gt;)/,blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$2("$1","$2"),blog.color_tree.replace_line_starts(/(│&nbsp;&nbsp;\s*[├──├─└─\s]*\s*)([\w\-\.]*\s*)(&lt;g&gt;)/,blog.color_tree.treeG.cljs$core$IFn$_invoke$arity$2("$1","$2"),blog.color_tree.replace_line_starts(/(│&nbsp;&nbsp;\s│&nbsp;&nbsp;\s[├──├─└─\s]*\s*)([\w\-\.]*\s*)(&lt;r&gt;)/,blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$2("$1","$2"),blog.color_tree.replace_line_starts(/(│&nbsp;&nbsp;\s*[├──├─└─]*\s*)([\w\-\.]*\s*)(&lt;r&gt;)/,blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$2("$1","$2"),blog.color_tree.replace_line_starts(/([├──├─]*\s*)([\w\-\.]*\s*)(&lt;r&gt;)/,blog.color_tree.treeR.cljs$core$IFn$_invoke$arity$2("$1","$2"),blog.color_tree.replace_line_starts(/(│&nbsp;&nbsp;\s│&nbsp;&nbsp;\s[├─└─\s]*\s*)([\w\-\.]*\s*)(&lt;b&gt;)/,blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$2("$1","$2"),blog.color_tree.replace_line_starts(/(│&nbsp;&nbsp;\s*[├─└─]*\s*)([\w\-\.]*\s*)(&lt;b&gt;)/,blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$2("$1","$2"),blog.color_tree.replace_line_starts(/([├──├─└─]*\s*)([\w\-\.]*\s*)(&lt;b&gt;)/,blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$2("$1","$2"),blog.color_tree.replace_line_starts(/(\/.*\s*)(&lt;b&gt;)/,blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$1("$1"),blog.color_tree.replace_line_starts(/(\.\s*)(&lt;b&gt;)/,blog.color_tree.treeB.cljs$core$IFn$_invoke$arity$1("$1"),clojure.string.split.cljs$core$IFn$_invoke$arity$2(target_12121.innerHTML,/\n/)))))))))))))))))));

var G__12122 = (i + (1));
i = G__12122;
continue;
} else {
return null;
}
break;
}
});
blog.color_tree.color_tree = (function blog$color_tree$color_tree(){
return blog.color_tree.color_tree_prompt("example");
});
