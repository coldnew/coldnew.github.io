// Compiled by ClojureScript 1.7.228 {:static-fns true, :optimize-constants true}
goog.provide('blog.cmds');
goog.require('cljs.core');
goog.require('clojure.string');
blog.cmds.toggle_visible = (function blog$cmds$toggle_visible(id){
var e = document.getElementById(id);
var s = e.style.display;
return e.style.display = (((cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(s,"block")) || (cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(s,"")))?"none":"block");
});
goog.exportSymbol('blog.cmds.toggle_visible', blog.cmds.toggle_visible);
