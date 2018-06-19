# SignalFx Enhanced RDS Monitoring Integration

These instructions will describe the steps to deploy the Lambda function to
parse and report your Enhanced RDS metrics to SignalFx ingest.

**Note: These instructions assume you have already enabled Enhanced Monitoring
for the RDS instances you want to monitor. You can find instructions to set
this up [here](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Monitoring.OS.html).**

## Setup

### Choose security preferences regarding your SignalFx access token
The Lambda function requires your SignalFx access token to route
the metrics to your organization. The token will be saved as an environment
variable for the function. While Lambda encrypts all environment variables at
rest and decrypts them upon invocation, AWS recommends that sensitive
information be encrypted using a KMS key before the creation of the function
and decrypted at runtime within the code. Either scheme can be configured using
the Serverless Application Repository template as well as building from source.

### Deploying through the Serverless Application Repository (recommended)
1. Set up an encryption key and encrypt your access token (if desired)
2. Determine the subset of desired metric groups.
3. Create and configure the Lambda function using one of the templates on the
Serverless Application Repository. Find the template for encrypted access
tokens [here](https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:134183635603:applications~signalfx-enhanced-rds-metrics-encrypted)
or the non encrypted version [here](https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:134183635603:applications~signalfx-enhanced-rds-metrics).

### Deploying after building from source
1. Set up the execution role for the Lambda with the proper permissions
2. Set up a KMS encryption key and encrypt your SignalFx organization access
token if desired.
3. Decide if there are certain metric groups you do not want to send
4. Clone the source repo from
[here](https://github.com/signalfx/enhanced-rds-monitoring)
and build the deployment package.
5. Create and configure the Lambda function.

## Deploying through the Serverless Application Repository

### Set up an encryption key and encrypt your access token (if desired)
Only follow this step if you chose to manually encrypt your access token.
Either create a new KMS encryption key or select a preexisting one. **The key
must be in the same availability zone as the RDS instances you are
monitoring.** You can create and manage encryption keys from IAM in the AWS
management console. Documentation on KMS encryption from the CLI can be found
[here](http://docs.aws.amazon.com/cli/latest/reference/kms/encrypt.html). Make
sure you have access to the cipher text output by the encryption as well as the
key id of the encryption key you used.

### Determine the desired set of metric groups
This step is necessary if you only want a subset of the metric groups to be
reported. You can find documentation on the available metrics
[here](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuid/USER_Monitoring.OS.html).
You will be able to apply these choices later in the setup process.

The available groups are as follows:

**Metric Groups (except for SQLServer)**
- cpuUtilization
- diskIO
- fileSys
- loadAverageMinute
- memory
- network
- swap
- tasks
- OSprocesses*
- RDSprocesses*

**Metric Groups for SQLServer**
- cpuUtilization
- disks
- memory
- network
- system
- OSprocesses*
- RDSprocesses*

*Process-based metric group added by SignalFx, does not appear in AWS
documentation

### Create and configure the Lambda function

#### Create the Lambda
Click create function from the list of Lambda functions in your AWS console.
Make sure you are in the intended availability zone. Select the
`Serverless Application Repository` option in the upper right hand corner.
Search for `signalfx rds` and choose the appropriate entry based on whether you
encrypted your access token.

#### Fill out application parameters
Under `Configure application parameters`, choose a name for your function,
and fill out the fields accordingly.

**Parameters for non-encrypted version**
- SignalFxAuthToken: Your SignalFx organization's access token
- SelectedMetricGroups: The metric groups you wish to send. Enter `All` if you
  want all available metrics.

**Parameters for encrypted version**
- EncryptedSignalFxAuthToken: The Ciphertext blob output from your encryption
  of your SignalFx organization's access token
- KeyId: The key id of your KMS encryption key; it is the last section of the
  key's ARN
- SelectedMetricGroups: The metric groups you wish to send. Enter `All` if you
  want all available metrics. 
 
#### Deploy function and configure trigger
Click `Deploy`. Once the function has finished deploying, navigate to the
function's main page. 

Under the `Configuration` tab, scroll through the list on the left and
select CloudWatch Logs as the source of the trigger. Below there will be
specific configurations for the trigger. Select `RDSOSMetrics` as the log
group. Choose an appropriate name for the filter, and leave the filter pattern
blank. Make sure the `Enabled` switch is activated, click `Add`, then click
`Save` in the upper right corner.

That's it! Your metrics are on the way to SignalFx ingest!

## Building from source

### Set up the execution role
The execution role just needs basic Lambda execution permissions and KMS
decrypt permissions (if you wish to encrypt your SignalFx access token). If you
don't want to create one, you can select from a list of templates when you
create the lambda function.

### Set up an encryption key and encrypt access token
Only follow this step if you chose to encrypt your access token. Either create
a new KMS encryption key or select a preexisting one. **The key must be in the
same availability zone as the RDS instances you are monitoring.** You can
create and manage encryption keys from IAM in the AWS management console.
Documentation on KMS encryption from the CLI can be found
[here](http://docs.aws.amazon.com/cli/latest/reference/kms/encrypt.html).
Make sure you have access to the cipher text output by the encryption as well
as the key id of the encryption key you used.

### Determine the desired set of metric groups
This step is necessary if you only want a subset of the metric groups to be
reported. You can find documentation on the available metrics
[here](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuid/USER_Monitoring.OS.html).

The available groups are as follows:

**Metric Groups (except for SQLServer)**
- cpuUtilization
- diskIO
- fileSys
- loadAverageMinute
- memory
- network
- swap
- tasks
- OSprocesses*
- RDSprocesses*

**Metric Groups for SQLServer**
- cpuUtilization
- disks
- memory
- network
- system
- OSprocesses*
- RDSprocesses*

*Process-based metric group added by SignalFx, does not appear in AWS
documentation

### Clone the source repo and build the deployment package
You can find the repo
[here](https://github.com/signalfx/enhanced-rds-monitoring).
Once you have cloned the repo:
```
$ cd enhanced-rds-monitoring
$ ./build.sh
```
The package will be named `enhanced_rds.zip`. This will be the file to upload
for the Lambda.

### Create and configure the Lambda function
From the Lambda creation screen, make sure you have selected
`Build from scratch`. Select a name for your function. For `Runtime` select
`Python2.7`. For the execution role, either select the role you wish to use or
select `Create from Template` and add KMS decrypt permissions if need be. You
will also need to choose a name for the role.

#### Designer
The only thing to be done here is set up the trigger from CloudWatch Logs.
Select CloudWatch Logs from the list on the left. Below, a section labelled
`Configure triggers` will appear. For the `Log group` field, select
`RDSOSMetrics`. You must also choose a filter name, but leave the filter
pattern blank. You can disable the trigger to start if you wish (though you
will need to manually enable it later to start sending metrics), then click
Add.

#### Function code
Once the function is created you can change the configurations. Upload the ZIP
file containing the deployment package. Change the text in `Handler` to be
`lambda_script.lambda_handler`.

#### Environment variables
Under `Environment Variables`, add one with a key of `groups`. This is the list
of metric groups that will be sent. List the groups, spelled exactly as above,
separated by single spaces. If you want all the groups, enter `All`.

If you are encrypting your access token, create a variable with the key
`encrypted_access_token`. Otherwise name the variable `access_token`. Paste
your access token as the value. If you are going the encryption route, under
`Encryption configuration`, check the box to `Enable helpers for encryption in
transit`. A new field will appear labelled `KMS key to encrypt in transit`.
Select the encryption key you wish to use from the dropdown. A button labelled
`Encrypt` will appear next to your environment variables. Click the Encrypt
button next to `encrypted_access_token` once. Your token should be replaced by
a Ciphertext blob.

#### Basic settings
Under basic settings, set `Timeout` to `0 min 5 sec`.

Click Save, and once the trigger is enabled, your function will start sending
your metrics to SignalFx!
