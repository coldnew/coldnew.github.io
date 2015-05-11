;;; config.el for emacs-blogit

(require 'blogit)
(require 'f)

;; current dir
(setq blogit~config-directory
      (file-name-directory (or load-file-name (buffer-file-name))))

;; cache dir that stores org-mode and pelican cache
(setq blogit-cache-directory
      (f-join blogit~config-directory "cache"))

;; contents dir that pelican can parse and generate output.
(setq blogit-output-directory
      (f-join blogit~config-directory "content"))

;; org-mode source of your blog.
(setq blogit-source-directory
      (expand-file-name "~/Org/blog"))

;; template dir
(setq blogit-template-directory
      (f-join blogit~config-directory "template"))

;; clear all output when republish
(setq blogit-clear-ouput-when-republish t)

;;;;;;;;;;;;;
;; Personal config (not offical support by blogit)

(setq coldnew/blogit-compact-dir
      (f-join blogit~config-directory "sources"))

;; final output for pelican
(setq coldnew/blogit-final-output-directory
      (f-join blogit~config-directory "output"))

;; trigger pelican regenerate output
(add-hook 'blogit-after-publish-hook
          (lambda()
            (shell-command (concat
                            "pelican -s " (f-join blogit~config-directory "pelicanconf.py")))
            ))

;; Main blogit source
(add-to-list 'blogit-publish-project-alist
             `("article" ;; an identifier
               :base-directory ,blogit-source-directory
               :base-extension "org" ;; export org files
               :publishing-function (org-pelican-publish-to-html org-org-publish-to-org)
               :auto-sitemap nil ;; don't generate a sitemap (kind of an index per folder)
               :publishing-directory ,blogit-output-directory
               :headline-levels 4 ;; Just the default for this project.
               :auto-preamble nil ;; Don't add any kind of html before the content
               :export-with-tags t
               :todo-keywords nil
               :html-doctype "html5" ;; set doctype to html5
               :html-html5-fancy t
               :creator-info nil ;; don't insert creator's info
               :htmlized-source t
               :auto-postamble nil ;; Don't add any kind of html after the content
               :html-postamble nil ;; same thing
               :timestamp nil ;;
               :exclude-tags ("noexport" "todo"))
             :recursive nil)

;; basic static source (ex: images, data)
(add-to-list 'blogit-publish-project-alist
             `("static" ;; identifier for static files
               :base-directory  ,blogit-source-directory
               :publishing-directory ,blogit-output-directory
               :base-extension "css\\|js\\|png\\|jpg\\|gif\\|pdf\\|mp3\\|ogg\\|swf"
               :publishing-function org-publish-attachment
               :recursive t))

;; some old pages need to be redirect
(add-to-list 'blogit-publish-project-alist
             `("backward-compability"
               :base-directory ,coldnew/blogit-compact-dir
               :base-extension "org"
               :publishing-function org-html-publish-to-html
               :publishing-directory ,coldnew/blogit-final-output-directory
               ;; no need to style up since it just redirect pages
               :html-head-include-scripts nil
               :html-head-include-default-style nil
               :recursive t))

;; Readme file for github
;; TODO: