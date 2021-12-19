struct user:
    addr: address
    name: String[32]
    email: String[32]
    lastupdate: uint256
    viewable: bool

struct message:
    useraddr: address
    textmsg: String[1000]
    viewable: bool
    update: uint256

# 这个是用来存储最大的容量的
LARGESTSIZE: constant(uint256) = 30

# ZERO_ADDRESS 这个是空地址的变量
# 这个只是用来声明所有者的
contractOwner: public(address)


# 因为msg没有动态数组，所以只能预设长度
messages: public(message[LARGESTSIZE])
# users: public(user[LARGESTSIZE])
# pendingReturns: public(HashMap[address, uint256])

users: public(HashMap[address, user])
# 存储协议过期的时间，类似于设置网站的有效期，如果这是一个有时效性的项目
expirtime: public(uint256)

# 存储总的eth容量，通常情况下是给所有者展示用的
# 如果是类似于水滴筹的话，可以withdrewh所有
totalEth: public(uint256)

# 向用户展示这一协议是否开启了
contractopen: public(bool)

sizeofmsgs: public(uint256)
# 这就是个初始化的函数
@external
def __init__(owneraddr: address):
    self.sizeofmsgs = 0
    self.totalEth = 0
    self.contractopen = True
    # 1671435088 = 	Mon Dec 19 2022 07:31:28 GMT+0000
    self.expirtime = 1671435088
    # 这个是预设ContractOwner，如果是自用的话，可以提前设置好
    self.contractOwner =  owneraddr

@external
@payable
def sign(name: String[32], email: String[32], text: String[1000]):
    self.totalEth += msg.value
    self.messages[self.sizeofmsgs].useraddr = msg.sender
    self.messages[self.sizeofmsgs].textmsg = text
    self.messages[self.sizeofmsgs].update = block.timestamp
    self.users[msg.sender].addr = msg.sender
    self.users[msg.sender].name = name
    self.users[msg.sender].email = email
    self.users[msg.sender].lastupdate = block.timestamp
    self.users[msg.sender].viewable = True
    self.messages[self.sizeofmsgs].viewable = True
    # block.timestamp
    self.sizeofmsgs += 1
# <-----到这里一个聊天室的基本功能就已经实现了，这个Contract没有实际上的数据库相连接，但是messages和UserHashMap通过 address作为key连接------------------------>