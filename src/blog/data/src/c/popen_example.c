#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
        FILE *pf = popen("ls -l | wc -l", "r");
        char d[3];
        fgets(d, 3, pf);

        printf("%d\n", atoi(d));
        pclose(pf);

        return 0;
}
