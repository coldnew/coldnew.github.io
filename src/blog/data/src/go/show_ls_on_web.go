package main

import "os/exec"
import "log"
import "io"
import "net/http"

func handler(w http.ResponseWriter, r *http.Request) {
  out, err := exec.Command("ls").Output()
  if err != nil {
    log.Fatal(err)
  }
  io.WriteString(w, string(out))
}

func main() {
  http.HandleFunc("/", handler)
  http.ListenAndServe(":8080", nil)
}
