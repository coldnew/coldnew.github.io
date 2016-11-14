;;; config.el for emacs-blogit

(require 'blogit)
(require 'org-hexo)
(require 'f)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; hexo options

(setq org-hexo-overwrite-updated t)

(setq org-hexo-htmlize-src-block t)
(setq org-hexo-enable-htmlize t)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; current dir
(setq blogit~config-directory
      (file-name-directory (or load-file-name (buffer-file-name))))

;; FIXME: hexo use db.json
;; cache dir that stores org-mode and pelican cache
(setq blogit-cache-directory
      (f-join blogit~config-directory "cache"))

;; contents dir that pelican can parse and generate output.
(setq blogit-output-directory
      (f-join blogit~config-directory "source/_posts"))

(setq blogit-output-draft-directory
      (f-join blogit~config-directory "source/_drafts"))

;; org-mode source of your blog.
(setq blogit-source-directory
      (expand-file-name "~/Org/blog")
;;      (f-join blogit~config-directory "tmp")
      )

(setq blogit-draft-directory
      (expand-file-name "~/Org/draft"))

(setq blogit-note-directory
      (expand-file-name "~/Org/note"))

(setq blogit-pratice-directory
      (expand-file-name "~/Org/pratice"))

;; template dir
(setq blogit-template-directory
      (f-join blogit~config-directory "template"))

;; clear all output when republish
(setq blogit-clear-ouput-when-republish t)

;;;;;;;;;;;;;
;; Personal config (not offical support by blogit)

;; final output for pelican
(setq coldnew/blogit-final-output-directory
      (f-join blogit~config-directory "public"))

(add-hook 'blogit-before-publish-hook
          (lambda()
            ;; remove all draft data
            (delete-directory blogit-output-draft-directory t nil)
            ;; recreate directory
            (make-directory blogit-output-draft-directory t)
            ;; disable whitespace mode
            (whitespace-mode -1)
            ;;(global-vim-empty-lines-mode -1)
            ))

;; trigger pelican regenerate output
(add-hook 'blogit-after-publish-hook
          (lambda()
            (global-whitespace-mode -1)
            ;;(global-vim-empty-lines-mode 1)
            ))

;; Main blogit source
(add-to-list 'blogit-publish-project-alist
             `("blog"
               :base-directory ,blogit-source-directory
               :base-extension "org"
               ;;               :publishing-function org-hexo-publish-to-markdown
               :publishing-function org-hexo-publish-to-html
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

(add-to-list 'blogit-publish-project-alist
             `("draft"
               :base-directory ,blogit-draft-directory
               :base-extension "org"
               :publishing-function org-hexo-publish-to-html
               :auto-sitemap nil
               :publishing-directory ,blogit-output-draft-directory
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

(add-to-list 'blogit-publish-project-alist
             `("note"
               :base-directory ,blogit-note-directory
               :base-extension "org"
               :publishing-function org-hexo-publish-to-html
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

(add-to-list 'blogit-publish-project-alist
             `("pratice"
               :base-directory ,blogit-pratice-directory
               :base-extension "org"
               :publishing-function org-hexo-publish-to-html
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
               :timestamp nil      ;;
               :exclude-tags ("noexport" "todo"))
             :recursive nil)
