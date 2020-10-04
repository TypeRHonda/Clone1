#include <stdio.h>
#include <errno.h>

#define MAXSTRINGSIZE 256
#define MAXRECSIZE 1024

int main(void) {

    FILE * fp;
    FILE * outfp;
    char filename[]="dataforfileio";
    char outputfilename[] = "outputforfileio";
    char record[MAXRECSIZE];
    int lastchar;

//    printf("Please enter a file name: ");
//    fgets(filename,MAXSTRINGSIZE,stdin);
    

    if ((fp = fopen(filename,"r")) == NULL) {
       perror("ERROR:  Unable to open file!");
       return(1);
    }

    if ((outfp = fopen(outputfilename,"w")) == NULL) {
       perror("ERROR:  Unable to open file!");
       return(1);
    }
    


    while ( (fgets(record,MAXRECSIZE,fp)) != NULL) {
          fprintf(stdout,"The record is %s\n",record);
          fprintf(outfp,"%s",record);
    }
   
    fclose(fp);
    fclose(outfp);
}


     
    
