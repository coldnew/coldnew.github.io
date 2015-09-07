#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <linux/rtc.h>
#include <time.h>
#include <sys/time.h>
#include <sys/ioctl.h>
#include <unistd.h>
#include <fcntl.h>

void update_sytem_time()
{
        int fd_rtc = open("/dev/rtc0", O_RDWR);
        if (fd_rtc < 0) {
                perror("ERROR: Open /dev/rtc failed");
        }

        struct rtc_time rtc_tm;
        struct tm sys_tm;

        if (!ioctl(fd_rtc, RTC_RD_TIME, &rtc_tm)) {
                sys_tm.tm_year = rtc_tm.tm_year;
                sys_tm.tm_mon  = rtc_tm.tm_mon;
                sys_tm.tm_mday = rtc_tm.tm_mday;
                sys_tm.tm_hour = rtc_tm.tm_hour;
                sys_tm.tm_min  = rtc_tm.tm_min;
                sys_tm.tm_sec  = rtc_tm.tm_sec;
                sys_tm.tm_wday = rtc_tm.tm_wday;

                const struct timeval tv = { mktime(&sys_tm), 0 };
                settimeofday(&tv, 0);
        }
        else {
                printf("UPDATE FALIED\n");
        }

        close(fd_rtc);
}

void update_random_rtc_clock ()
{
        /* initial rtc */
        int fd_rtc = open("/dev/rtc0", O_RDWR);
        if (fd_rtc < 0) {
                perror("ERROR: Open /dev/rtc failed");
        }

        struct rtc_time rtc_tm;
        time_t current = time(NULL);
        struct tm *sys_tm = localtime(&current);

        // setup rtc time in register
        rtc_tm.tm_mon  = sys_tm->tm_mon ;
        rtc_tm.tm_mday = sys_tm->tm_mday;
        rtc_tm.tm_hour = rand() % 12;
        rtc_tm.tm_min  = rand() % 60;
        rtc_tm.tm_sec  = rand() % 60;
        rtc_tm.tm_wday = rand() % 7;

        do {
                rtc_tm.tm_year = rand() % 200;
        }
        while (rtc_tm.tm_year + 1900 > 2030 || rtc_tm.tm_year + 1900 < 2000);

        // write to rtc
        int ret = ioctl(fd_rtc, RTC_SET_TIME, &rtc_tm);
        if (ret < 0) {
                perror("ERROR: SET /dev/rtc failed");
        }
        printf("Write RTC:  %04d/%02d/%02d %02d:%02d:%02d   \n",
               rtc_tm.tm_year + 1900,
               rtc_tm.tm_mon + 1,
               rtc_tm.tm_mday,
               rtc_tm.tm_hour,
               rtc_tm.tm_min,
               rtc_tm.tm_sec);
        /* close rtc */
        close(fd_rtc);

        printf("hwclock:\n");
        system("hwclock");
        printf("\n");
}


int main(int argc, char*argv[])
{
        srand(time( NULL ));

        while (1) {
                // write rtc time to system time
                update_random_rtc_clock();

                // Write RTC time to system
                update_sytem_time();

                // delay 1 sec
                usleep(1000 * 1000);
        }
        return 0;
}
