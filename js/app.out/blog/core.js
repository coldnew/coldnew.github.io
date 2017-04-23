// Compiled by ClojureScript 1.7.228 {:static-fns true, :optimize-constants true}
goog.provide('blog.core');
goog.require('cljs.core');
goog.require('blog.color_prompt');
goog.require('blog.color_tree');
goog.require('blog.cmds');
cljs.core.enable_console_print_BANG_();
blog.core.debug_helper = (function blog$core$debug_helper(){
return console.log("starting clojurescript helper for coldnew's blog.");
});
NodeList.prototype.cljs$core$ISeqable$ = true;

NodeList.prototype.cljs$core$ISeqable$_seq$arity$1 = (function (array){
var array__$1 = this;
return cljs.core.array_seq.cljs$core$IFn$_invoke$arity$2(array__$1,(0));
});
HTMLCollection.prototype.cljs$core$ISeqable$ = true;

HTMLCollection.prototype.cljs$core$ISeqable$_seq$arity$1 = (function (array){
var array__$1 = this;
return cljs.core.array_seq.cljs$core$IFn$_invoke$arity$2(array__$1,(0));
});
blog.core.init = (function blog$core$init(){
blog.core.debug_helper();

blog.color_prompt.color_prompt();

return blog.color_tree.color_tree();
});
