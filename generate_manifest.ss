;; Script Chez Scheme Definitivo para Geração de Manifesto Duplo
;; Scriptorium Digital - paulolopes.org
(import (chezscheme))

(define (generate-manifest)
  (printf "A gerar manifest.json e manifest-all.json em Chez Scheme...\n")
  (let ((entries '()))
    (if (file-directory? "md")
        (let ((cats (directory-list "md")))
          (for-each
            (lambda (cat)
              (let ((cat-str (if (symbol? cat) (symbol->string cat) cat)))
                (let ((cat-path (string-append "md/" cat-str)))
                  (if (file-directory? cat-path)
                      (let ((files (directory-list cat-path)))
                        (for-each
                          (lambda (file)
                            (let ((file-str (if (symbol? file) (symbol->string file) file)))
                              (let ((filepath (string-append cat-path "/" file-str)))
                                (if (file-regular? filepath)
                                    (let ((len (string-length file-str)))
                                      (if (and (> len 3)
                                               (string=? (substring file-str (- len 3) len) ".md"))
                                          (let ((slug (substring file-str 0 (- len 3)))
                                                (path (string-append "/" cat-path "/" file-str)))
                                            (if (not (string=? slug "teste"))
                                                (begin
                                                  (set! entries
                                                    (cons (list
                                                            (cons 'path path)
                                                            (cons 'section cat-str)
                                                            (cons 'slug slug))
                                                          entries))
                                                  (printf "Artigo detetado: ~a / ~a\n" cat-str slug))
                                                #f))
                                          #f))
                                    #f))))
                          files))
                      #f))))
            cats))
        #f)

    ;; Ordenar as entradas por slug/nome de forma descendente (recente primeiro)
    (define sorted-entries
      (sort (lambda (a b)
              (string>? (cdr (assoc 'slug a)) (cdr (assoc 'slug b))))
            entries))

    ;; 1. Escrever manifest-all.json (Mapeamento total)
    (call-with-output-file "manifest-all.json"
      (lambda (p)
        (fprintf p "{\n  \"artigos\": [\n")
        (let loop ((lst sorted-entries) (first? #t))
          (if (null? lst)
              #f
              (let ((entry (car lst)))
                (if (not first?) (fprintf p ",\n") #f)
                (fprintf p "    {\n      \"path\": ~s,\n      \"section\": ~s,\n      \"slug\": ~s\n    }"
                         (cdr (assoc 'path entry))
                         (cdr (assoc 'section entry))
                         (cdr (assoc 'slug entry)))
                (loop (cdr lst) #f))))
        (fprintf p "\n  ]\n}\n"))
      'replace)
    (printf "manifest-all.json gerado com sucesso!\n")

    ;; 2. Criar manifest.json leve (Top 3 a 5 mais recentes por secção para carregamento ultra-rápido na Home)
    (let* ((sections (delete-duplicates (map (lambda (e) (cdr (assoc 'section e))) sorted-entries)))
           (light-entries
            (apply append
                   (map (lambda (sec)
                          (let ((sec-entries (filter (lambda (e) (string=? (cdr (assoc 'section e)) sec)) sorted-entries)))
                            (let take-n ((lst sec-entries) (n 3))
                              (if (or (null? lst) (= n 0))
                                  '()
                                  (cons (car lst) (take-n (cdr lst) (- n 1)))))))
                        sections))))

      (call-with-output-file "manifest.json"
        (lambda (p)
          (fprintf p "{\n  \"artigos\": [\n")
          (let loop ((lst light-entries) (first? #t))
            (if (null? lst)
                #f
                (let ((entry (car lst)))
                  (if (not first?) (fprintf p ",\n") #f)
                  (fprintf p "    {\n      \"path\": ~s,\n      \"section\": ~s,\n      \"slug\": ~s\n    }"
                           (cdr (assoc 'path entry))
                           (cdr (assoc 'section entry))
                           (cdr (assoc 'slug entry)))
                  (loop (cdr lst) #f))))
          (fprintf p "\n  ]\n}\n"))
        'replace)
      (printf "manifest.json leve gerado com sucesso (~a entradas principais)!\n" (length light-entries)))))

(define (safe-run)
  (guard (con [else (begin (display "Erro fatal no manifesto.\n") (exit 255))])
    (generate-manifest)))

(safe-run)
