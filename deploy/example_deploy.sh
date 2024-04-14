localDir=""
remoteDir=""
remoteSSHlogin=""
remoteSSHport=""
archiveName="archive.zip"

#Change directory project folder 
printf ">>> Changing directory to local working directory $localDir\n\n"
cd $localDir
ls -l
printf "\n====\n\n"

#Create archive of project
printf ">>> Zipping up project as $archiveName\n\n" 

zip -r -q $archiveName \
"public/"

printf "\n"
ls -l
printf "\n====\n\n"

#Move archive to remote server
printf ">>> Moving project archive to remote server $remoteDir\n\n" 
scp -P $remoteSSHport archive.zip "$remoteSSHlogin:$remoteDir"
printf "\n====\n\n"

#Archive previous version of site and unzip new version
printf ">>> Archiving previous version of project\n\n" 
ssh -p $remoteSSHport $remoteSSHlogin 'cd '$remoteDir'; rm -r previous-public; mv public previous-public; ls -l'
printf "\n====\n\n"

printf ">>> Unzipping new project version at " 
ssh -p $remoteSSHport $remoteSSHlogin 'cd '$remoteDir'; unzip -q '$archiveName'; pwd; ls -l'
printf "\n====\n\n"

#Reduce permissions on unzipped files
printf ">>> Reduce permissions on unzipped files\n\n" 
ssh -p $remoteSSHport $remoteSSHlogin 'cd '$remoteDir'; chmod -R 755 public'

printf ">>> Done.\n\n" 