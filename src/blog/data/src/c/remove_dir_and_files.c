#include <stdio.h>
#include <stdlib.h>
#include <ftw.h>
#include <unistd.h>

int unlink_cb1(const char *fpath, const struct stat *sb, int typeflag, struct FTW *ftwbuf)
{
        int rv = remove(fpath);

        if (rv)
                perror(fpath);

        return rv;
}

int unlink_cb2(const char *fpath, const struct stat *sb, int typeflag, struct FTW *ftwbuf)
{
        int rv;

        if (ftwbuf->level == 0)
                return 0;

        rv = remove(fpath);

        if (rv)
                perror(fpath);

        return rv;
}

int remove_dir_and_files(char *path)
{
        return nftw(path, unlink_cb1, 64, FTW_DEPTH | FTW_PHYS);
}

int remove_dir_files_but_keep_dir_exist(char *path)
{
        return nftw(path, unlink_cb2, 64, FTW_DEPTH | FTW_PHYS);
}


int main(int argc, char *argv[])
{
        remove_dir_and_files("test1");
        remove_dir_files_but_keep_dir_exist("test2");

        return 0;
}
