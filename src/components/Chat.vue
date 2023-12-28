<template>

  <!-- start chat -->
  <v-toolbar v-if="!dialog" class="toolbar-navbar">
    <div class="column-navbar">
      <p class="name-company">로그인된 사용자가 없습니다.</p>
    </div>
    <!-- edit style -->
    <div class="column-navbar2">
      <p @click="closeOnParent">
        <v-icon>mdi-close</v-icon>
      </p>
    </div>
  </v-toolbar>
  <v-row justify="center">
    <v-dialog v-model="dialog" fullscreen :scrim="false" transition="">
      <v-card v-if="isActive" class="card-size-dialog">
        <v-toolbar class="toolbar-navbar">
          <div class="column-navbar">
            <p class="name-company">{{ siteName }}</p>
            <p class="time-work">
              고객센터 운영시간 : {{ workTimeStart }} ~ {{ workTimeEnd }}
            </p>
          </div>
          <div class="column-navbar2">
            <p class="close-icon" @click="closeOnParent">
              <v-icon>mdi-close</v-icon>
            </p>
          </div>
        </v-toolbar>
        <v-card class="card-size-all">
          <v-list class="card-in-message">
            <div>
              <p class="text-time-date-top">{{ currentDate }}</p>
            </div>
            <v-row>
              <div class="position-name-in-chat">
                <p class="text-name-in-chat">
                  기아멤버스 카앤라이프몰
                  <span class="text-time-name">{{ cuurentTime }}</span>
                </p>
                <div class="text-message-popup-auto">
                  <div v-html="greeting"></div>
                </div>
              </div>
            </v-row>
            <!-- Buttons round 1 -->
            <div class="position-btn-chat">
              <v-row v-if="showButtonsRow">
                <p class="chat-btn-style" @click="isHaveOrder ? showContent('orderInquiry') : showQuestion()">주문 상품문의</p>
                <p class="chat-btn-style" @click="showContent('deliveryInquiry')">배송조회</p>
                <p class="chat-btn-style" @click="showContent('returnsAndExchanges')">반품/교환</p>
                <p class="chat-btn-style" @click="showContent('oneToOneInquiry')">1:1 문의</p>
              </v-row>
            </div>
            <!-- {{ ordersItemList }} -->
            <!-- {{ messages }} -->
            <!-- {{ customer }} -->
            <!-- Messages container -->


            <div ref="messages" id="messages" class="messages">

              <div v-for="message in messages" :key="message._id">
                <div class="message-container" :class="{
                  'agent-message': message.is_customer,
                  'customer-message': !message.is_customer,
                }">
                  <p style="font-size: 10px; color: gray">
                    <span class="text-siteName" v-if="!message.is_customer">{{ siteName }} </span>
                    <span class="text-createdAt">{{ cuurentTime }}</span>
                  </p>

                  <div class="message-content agent-message left-align" :style="{
                    backgroundColor: message.is_customer
                      ? '#e8efff'
                      : '#f3f4f7',
                    borderRadius: message.is_customer
                      ? '10px 10px 0px 10px'
                      : '10px 10px 10px 0px',
                  }">

                    <div v-if="message._id === 'deliveryInquiry2'">
                      <p class="messages-popup-tacking">
                        고객님께서 최근 1개월 이내 주문하신 내역입니다. <br>
                        배송조회를 위한 주문번호를 선택해주세요.
                      </p>
                    </div>
                    <div v-else>
                      <div v-html="message.content"></div>
                    </div>
                    <div v-if="message._id === 'orderInquiry2'">
                      <p class="messages-popup-tacking">
                        고객님께서 최근 1개월 이내 주문하신 내역입니다.<br>
                        주문번호를 선택해주세요.
                      </p>
                    </div>

                    <div v-if="message._id === 'orderDetailMessage3'">
                      <p class="messages-popup-tacking">
                        {{ this.order_name }}<br>
                        주문 상세 또는 1:1문의 메뉴를 선택해주세요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Conditional v-card delivery_url-->
            <v-card v-if="activeContent === 'deliveryInquiry'" elevation="0">
              <div v-if="isDataLoadingSlow" class="order-date">Data is loading slowly, please wait...</div>
              <v-row class="order-list">
                <div v-for="item in ordersDetails" :key="item.orderNo" class="order-item"
                  @click="showOrderAlert(item.orderNo, item.shippingUrl,item.CompanyName,item.delivery_no,item.deliveryName)">
                  <div class="order-item-border">
                    <div style="width: 50px; height: 50px; padding: 0 5px;"><v-img :src="item.imgPath"></v-img></div>
                    <div style="width: 100%" class="menu-order">
                      <div class="order-date">{{ item.writeDate }}</div>
                      <div>
                        <div class="order-number">주문번호: {{ item.orderNo }}</div>
                        <div class="product-name">{{ item.name }}</div>
                        <div class="product-price">{{ item.unitPrice }}원 / {{ item.amount }}개</div>
                        <!-- <div class="product-price1">{{ item.shippingUrl }}</div> -->
                      </div>
                    </div>
                  </div>
                </div>
              </v-row>
            </v-card>

            <!-- use for shipping -->
            <v-card v-if="activeContent === 'orderInquiry'" elevation="0">
              <div>
                <div v-if="isDataLoadingSlow" class="order-date">Data is loading slowly, please wait...</div>
                <v-row class="order-list">
                  <div v-for="item in ordersDetails" :key="item.orderNo" class="order-item"
                    @click="showOrderAlert1(item.orderNo, item.name)">
                    <div class="order-item-border">
                      <div style="width: 50px; height: 50px; padding: 0 5px;"><v-img :src="item.imgPath"></v-img></div>
                      <div style="width: 100%" class="menu-order">
                        <div class="order-date">{{ item.writeDate }}</div>
                        <div>
                          <div class="order-number">주문번호: {{ item.orderNo }}</div>
                          <div class="product-name">{{ item.name }}</div>
                          <div class="product-price">{{ item.unitPrice }}원 / {{ item.amount }}개</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-row>
              </div>
            </v-card>
            <!-- Buttons round 2 has order -->
            <div v-if="showButtons_has" class="position-btn-chat1">
              <v-row> <!-- EDIT this click v-row-->
                <p class="chat-btn-style" @click="showContentDelivery_details(this.shippingUrl)">배송상세조회</p>
                <p class="chat-btn-style" @click="showContent('oneToOneInquiry')">1:1 문의</p>
                <p class="chat-btn-style" @click="showContentPrevious('deliveryInquiry')">이전단계</p>
                <p class="chat-btn-style" @click="showContentBackF('returnsAndExchanges')">처음으로</p>
              </v-row>
            </div>
            <!-- Buttons round 2 no order -->
            <div v-if="showButtons" class="position-btn-chat1">
              <v-row> <!-- EDIT this click v-row-->
                <p class="chat-btn-style" @click="showContentdetails('orderInquiry')">주문상세</p>
                <p class="chat-btn-style" @click="showContent('oneToOneInquiry')">1:1 문의</p>
                <p class="chat-btn-style" @click="showContentPrevious('deliveryInquiry')">이전단계</p>
                <p class="chat-btn-style" @click="showContentBackF('returnsAndExchanges')">처음으로</p>
              </v-row>
            </div>
            <!-- Buttons round 2 with name of products -->
            <div v-if="showButtons2_hasnamefrombutton" class="position-btn-chat">
              <v-row> <!-- EDIT this click v-row-->
                <p class="chat-btn-style" @click="showContentdetails('orderInquiry')">주문상세</p>
                <p class="chat-btn-style" @click="showContent('oneToOneInquiry')">1:1 문의</p>
                <p class="chat-btn-style" @click="showContent('orderInquiry')">이전단계</p>
                <p class="chat-btn-style" @click="showContentBackF('returnsAndExchanges')">처음으로</p>
              </v-row>
            </div>
            <br>
            <div class="position-btn-Row2">
              <v-row v-if="showButtonsRow2">
                <v-list class="card-in-message">
                  <v-row>
                    <div class="position-name-in-chat">
                      <p class="text-name-in-chat">
                        기아멤버스 카앤라이프몰
                        <span class="text-time-name">오전 {{ cuurentTime }}</span>
                      </p>
                      <div class="text-message-popup-auto">
                        <!-- {{ greeting }} -->
                        <div v-html="greeting"></div>
                      </div>
                    </div>
                  </v-row>
                  <!-- Buttons round 2 to back 1 -->
                  <div class="showButtonsRow2">
                    <v-row>
                      <p class="chat-btn-style1" @click="isHaveOrder ? showContent('orderInquiry') : showQuestion()">주문상품문의</p>
                      <p class="chat-btn-style1" @click="showContent('deliveryInquiry')">배송조회</p>
                      <p class="chat-btn-style1" @click="showContent('returnsAndExchanges')">반품/교환</p>
                      <p class="chat-btn-style1" @click="showContent('oneToOneInquiry')">1:1 문의</p>
                    </v-row>
                  </div>
                </v-list>
              </v-row>
            </div>
          </v-list>
          <!-- Typing Indicator -->
          <div class="tryping" v-if="isTyping">
            <p style="color: #8899A8; font-size: 10px; font-weight: 500;">상담사가 답변을 작성중입니다...</p>
          </div>
          <v-form lazy-validati ref="form" @submit.prevent="sendMessage">
            <v-card class="card-input-send-size" elevation="0" rounded="0">
              <div class="column-size-send-msg d-flex">
                <textarea v-model="messageContent" type="text" class="input-message" maxlength="1000" autofocus
                  @keydown.enter.prevent="sendMessageOnEnter" :placeholder="!ismessageContent
                    ? '원하는 항목을 선택해주세요.'
                    : '메시지를 입력해주세요.'
                    " :disabled="!ismessageContent" :class="[
    'text-send',
    { 'text-send-active': messageContent },
  ]">
                </textarea>
                <button :class="[
                  'button-send',
                  { 'button-send-active': messageContent },
                ]" :disabled="!messageContent" type="submit">
                  보내기
                </button>
              </div>
            </v-card>
          </v-form>
        </v-card>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script src="./script.js"></script>
<style src="./style.css" scoped></style>
