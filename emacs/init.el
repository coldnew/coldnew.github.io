;;; init.el

;; Copyright (c) 2017 Yen-Chin, Lee.
;;
;; This file is not part of GNU Emacs.

;; This program is free software; you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation; either version 2, or (at your option)
;; any later version.
;;
;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.
;;
;; You should have received a copy of the GNU General Public License
;; along with this program; if not, write to the Free Software
;; Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

;;; Commentary:

;;;; Install packages

(package-install 'qml-mode)
(package-install 'clojure-mode)
(package-install 'python-mode)
(package-install 'newlisp-mode)
(package-install 'yaml-mode)
(package-install 'js2-mode)
(package-install 'dot-mode)
(package-install 'verilog-mode)
(package-install 'json-mode)
(package-install 'markdown-mode)
(package-install 'yasnippet)

;; We want to color the parentheses
(package-install 'rainbow-delimiters)
(add-hook 'prog-mode-hook #'rainbow-delimiters-mode)


(defvar config-path
  (file-name-directory (or load-file-name (buffer-file-name))))

;; load my-theme
(load (expand-file-name "coldnew-theme.el" config-path))
(load (expand-file-name "night-coldnew-theme.el" config-path))

;; use night-coldnew theme
(load-theme 'night-coldnew t)

;;;; Highlight escape char
(package-install 'highlight-escape-sequences)
(require 'highlight-escape-sequences)
;; Make face the same as builtin face
(put 'font-lock-regexp-grouping-backslash 'face-alias 'font-lock-builtin-face)
;; Enable globally
(hes-mode 1)

;;;; Highlight numbers
(package-install 'highlight-numbers)
(require 'highlight-numbers)
;; json-mode has it's own highlight numbers method
(add-hook 'prog-mode-hook '(lambda()
			     (if (not (derived-mode-p 'json-mode))
				 (highlight-numbers-mode))))


;;;; u-mode is some example I write for my blog post
(require 'generic-x)

(define-generic-mode 'u-mode
  ;; comments
  '(("//")  ("/*" . "*/"))
  ;; keywords
  '("Name" "Tel" "Password")
  ;; other syntax
  nil
  ;; filetype
  '("\\.u$")
  ;; init func
  nil
  "a emacs major-mode for u-language")


