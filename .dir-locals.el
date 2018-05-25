((nil .
      ((eval .
	     (progn

	       ;; make drag-and-drop image save in the same name folder as org file
	       ;; ex: `aa-bb-cc.org' then save image test.png to `aa-bb-cc/test.png'
	       (defun my-org-download-method (link)
		 (let ((filename
			(file-name-nondirectory
			 (car (url-path-and-query
			       (url-generic-parse-url link)))))
		       (dirname (file-name-sans-extension (buffer-name)) ))
		   (unless (file-exists-p dirname)
		     (make-directory dirname))
		   (expand-file-name filename dirname)))

	       (setq-local org-download-method 'my-org-download-method)

	       ;; setup for hexo.el
	       (setq-local hexo-new-format 'org)

	       )))))