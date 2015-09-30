
(require 'org-hexo)
(require 'f)


(setq org-hexo-overwrite-updated t)

(setq org-hexo-htmlize-src-block t)

(setq org-hexo-enable-htmlize t)

(setq org-hexo-config-directory
      (file-name-directory (or load-file-name (buffer-file-name))))

(setq org-hexo-output-directory
      (f-join org-hexo-config-directory "source/_posts"))

(setq org-hexo-clear-ouput-when-republish t)


(add-to-list 'org-hexo-publish-project-alist
             `("blog"
               :base-directory ,blogit-source-directory
               :base-extension "org"
               :publishing-function org-hexo-publish-to-markdown
               :auto-sitemap nil
               :publishing-directory ,blogit-output-directory
               :headline-levels 4 ;; Just the default for this project.
               :auto-preamble nil ;; Don't add any kind of html before the content
               :export-with-tags t
               :todo-keywords nil
               :html-doctype "html5" ;; set doctype to html5
               :html-html5-fancy t
               :creator-info nil ;; don't insert creator's info
               :htmlized-source nil
               :auto-postamble nil ;; Don't add any kind of html after the content
               :html-postamble nil ;; same thing
               :timestamp nil ;;
               :exclude-tags ("noexport" "todo"))
             :recursive nil)