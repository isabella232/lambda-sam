# SignalFx Enhanced RDS Monitoring Lambda

This AWS SAM template constructs a CloudFormation stack that will parse and
report your Enhanced RDS metrics to SignalFx ingest.

**Note: These instructions assume you have already enabled Enhanced Monitoring
for the RDS instances you want to monitor. You can find instructions to set
this up [here](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Monitoring.OS.html).**

## Setup
1. Choose security scheme for your SignalFx access token
2. Configure execution role according to the choice made in Step 1 and copy the
ARN of the role
3. Encrypt access token (if necessary)
4. Decide if there are certain metric groups you do not want to send

### Choose security scheme for your SignalFx access token
The Lambda function requires your SignalFx access token to route the metrics to
your organization. The token will be saved as an environment variable for the
function. While Lambda encrypts all environment variables at rest and decrypts
them upon invocation, AWS recommends that sensitive information be encrypted
using a KMS key before the creation of the function and decrypted at runtime
within the code. Either scheme can be configured using the template.

### Configure execution role

#### Automatic environment variable encryption
If you choose to let AWS handle the encryption, then your execution role just
needs basic Lambda execution privileges.

#### Manual environment variable encryption
If you want to encrypt your access token yourself, you will need to include KMS
Decrypt permissions in addition to the Lambda execution permissions. 

Once you have identified or created the execution role, save the ARN of that
role (this can be found on the IAM Role page for that role). This will be a
parameter for the template.

### Encrypt your access token
Only follow this step if you chose to manually encrypt your access token.
Either create a new KMS encryption key or select a preexisting one. You can
find documentation on KMS encryption from the CLI [here](http://docs.aws.amazon.com/cli/latest/reference/kms/encrypt.html).
The encrypted output will be one of the parameters for the template.

### Determine the set of desired metric groups
This step is necessary if you only want a subset of the metric groups to be
reported. You can find documentation for the available metrics [here](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Monitoring.OS.html).
You can specify either the groups you want to include or the groups you want to
exclude. Only provide one of these lists; if you provide both, only the
inclusive list will be parsed.

The format for the list should be a subset of the set of groups listed below,
separated by single spaces and spelled exactly as shown.

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

Save your list with the role ARN and the access token, encrypted or otherwise.

### Build the CloudFormation stack
Start the process of building a CloudFormation stack. When prompted, choose the
SignalFx template. On the details page, give the stack an appropriate name.

You will be presented with five fields for parameters, but you should only use
at most three of them. Paste the ARN of the execution role into the
`ExecutionRoleARN` field. If you encrypted your access token yourself, paste
the encrypted text into the `EncryptedAccessToken` field; otherwise, paste your
access token into the `PlainTextAccessToken` field. If you are filtering any of
the metric groups, paste that list into either the `MetricGroupsToInclude` or
`MetricGroupsToExclude` accordingly. You can leave the unused fields empty.

You can click next to move to the tagging step. This is not required for the
stack to work. The last step is to review the configuration of the stack and
verify that the proper permissions are available to create the resources in
AWS. This will be available at the bottom of the page; click the button `Create
Change Set` to verify the permissions. If there is an error, you may not have
the necessary AWS user permissions.

Once the stack is created, that's all you need! Your metrics are on their way
to SignalFx ingest. 
