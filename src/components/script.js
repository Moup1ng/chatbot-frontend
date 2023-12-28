import axios from "axios";
import io from "socket.io-client";
import { useEventListener } from "@vueuse/core";
import store from "@/store/index";

export default {
  data() {
    return {
      content1Active: false,
      currentTime: "",
      delivery_url: null,
      showDeliveryInquiry: false,
      isDataLoadingSlow: false,
      activeContent: null,
      activeContent2: null,
      messages: [],
      isActive: true,
      messageContent: "",
      socket: null,
      dialog: false,
      greeting: "",
      showGreeting: false,
      jsessionid: "",
      device: "",
      host: "",
      customer: {},
      tokenAuth: {},
      id: {},
      siteName: "",
      workTimeStart: "",
      workTimeEnd: "",
      roomId: "",
      name: "",
      id: "",
      siteCodes: "",
      ordersDetails: [],
      typingMessage: "",
      typingTimeout: null,
      isTyping: false,
      ChattingRoom: null,
      showButtonsRow: true,
      showButtons2_hasnamefrombutton: false,
      ismessageContent: false,
      showButtonsRow2: false,
      room_status: "",
      showButtons: false,
      showButtons_has: false,
      deliveryAvailable: false,
      // order
      order_no: "",
      CompanyName_name: "",
      isHaveOrder: false,
      order_name: "",
      shippingUrl: "",
      messagePushed: false,
    };
  },
  watch: {
    "$route.query.roomId": {
      immediate: true,
      handler: "fetchMessages",
    },
  },
  methods: {
    sendMessageOnEnter() {
      try {
        const trimmedMessage = this.messageContent.trim();
        if (trimmedMessage !== "") {
          this.sendMessage(trimmedMessage);
        } else {
          console.error("Empty message content");
        }
      } catch (error) {
        console.error("An error occurred while sending message:", error.message);
      }
      this.scrollToBottom();
    },

    startTyping() {
      const TYPING_EVENT = "typing";
      this.socket.emit(TYPING_EVENT);
    },

    stopTyping() {
      const STOP_TYPING_EVENT = "stopTyping";
      this.socket.emit(STOP_TYPING_EVENT);
    },

    showOrderAlert1(orderNo, order_name) {
      if (
        this.content1Active ||
        this.messages.some((message) => message._id === "oneToOneInquiry")
      ) {
        return;
      }

      this.order_name = order_name;
      const orderDetails = this.ordersDetails.find(
        (item) => item.orderNo === orderNo
      );

      let orderListTemplate = `<div style="border: 1px solid #e3e8edcc; border-radius: 10px; background-color: #fff">`;

      JSON.parse(JSON.stringify(this.ordersDetails)).forEach((orderDetail) => {
        orderListTemplate += `<div style="border-bottom: 1px solid #e3e8edcc; display: flex;">
                                <div style="width: 50px; height: 50px; padding: 0px 5px;">
                                  <div class="v-responsive v-img" style="width: 50px; height: 50px; padding: 0px 5px;">
                                    <div class="v-responsive__sizer" style="padding-bottom: 100%;">
                                    </div>
                                    <img class="v-img__img v-img__img--contain" style="width: " src="${orderDetail.imgPath}" style="">
                                  </div>
                                </div>
                                <div class="menu-order" style="width: 100%; font-size:12px; padding: 5px;">
                                  <div class="order-date" style="color: #8899A8; font-size:10px;">${orderDetail.writeDate}</div>
                                  <div>
                                    <div class="order-number" style="color: #8899A8; font-size:10px;">주문번호: ${orderDetail.orderNo}</div>
                                    <div class="product-name">${orderDetail.name}</div>
                                    <div class="product-price">${orderDetail.unitPrice} / ${orderDetail.amount}개</div>
                                  </div>
                                </div>
                              </div>`;
      });
      orderListTemplate += `</div>`;

      if (orderDetails) {
        this.messages.push({
          content: orderListTemplate,
          is_customer: false,
          _id: new Date().getTime(),
        });
        this.messages.push({
          content: `주문번호: ${orderDetails.orderNo}`,
          is_customer: true,
          _id: new Date().getTime(),
        });
        this.scrollToBottom();

        setTimeout(() => {
          this.messages.push({
            _id: "orderDetailMessage3",
            content: ``,
            is_customer: false,
            shippingUrl: "",
          });
          this.scrollToBottom();
          this.showButtons2_hasnamefrombutton = true; // Show the buttons with the name of products
        }, 1000);

        this.activeContent = null;
        this.scrollToBottom();
      }
      this.showButtonsRow = false;
      this.showButtons_has = false;
      this.showButtons = false;
      this.showButtonsRow2 = false;
      this.scrollToBottom();
    },

    showOrderAll() {
      const orderDetails = this.ordersDetails.find((item) => item.orderNo);

      // insert
      this.messages.push({
        content: `<div style="border-radius: 10px; background-color: #fff">
        <!-- Loop through ordersDetails -->
        <div v-for="item in ordersDetails" :key="item.orderNo" style="border: 1px solid #e3e8edcc; display: flex;">
          <div style="width: 50px; height: 50px; padding: 0px 5px;">
            <div class="v-responsive v-img">
              <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
              <!-- Use dynamic image source -->
              <img class="v-img__img v-img__img--contain" :src="item.imgPath" alt="">
            </div>
          </div>
          <div class="menu-order" style="width: 100%; font-size: 10px;">
            <!-- Format order date dynamically -->
            <div class="order-date">{{ new Date(item.writeDate).toLocaleDateString() }}</div>
            <div>
              <!-- Display dynamic order details -->
              <div class="order-number">주문번호: {{ item.orderNo }}</div>
              <div class="product-name">{{ item.name }}</div>
              <div class="product-price">{{ item.unitPrice }}원 / {{ item.amount }}개</div>
            </div>
          </div>
        </div>
      </div>
      `,
        is_customer: true,
        createdAt: this.currentTime,
      });
    },

    showOrderAlert(orderNo, shippingUrl, CompanyName,delivery_no,deliveryName) {
      if (
        this.content1Active ||
        this.messages.some((message) => message._id === "oneToOneInquiry")
      ) {
        return;
      }
      let shippingListTemplate = `<div style="border: 1px solid #e3e8edcc; border-radius: 10px; background-color: #fff">`;

      JSON.parse(JSON.stringify(this.ordersDetails)).forEach((orderDetail) => {
        shippingListTemplate += `<div style="border-bottom: 1px solid #e3e8edcc; display: flex;">
                                <div style="width: 50px; height: 50px; padding: 0px 5px;">
                                  <div class="v-responsive v-img" style="width: 50px; height: 50px; padding: 0px 5px;">
                                    <div class="v-responsive__sizer" style="padding-bottom: 100%;">
                                    </div>
                                    <img class="v-img__img v-img__img--contain" style="width: " src="${orderDetail.imgPath}" style="">
                                  </div>
                                </div>
                                <div class="menu-order" style="width: 100%; font-size:12px; padding: 5px;">
                                  <div class="order-date" style="color: #8899A8; font-size:10px;">${orderDetail.writeDate}</div>
                                  <div>
                                    <div class="order-number" style="color: #8899A8; font-size:10px;">주문번호: ${orderDetail.orderNo}</div>
                                    <div class="product-name">${orderDetail.name}</div>
                                    <div class="product-price">${orderDetail.unitPrice} / ${orderDetail.amount}개</div>
                                  </div>
                                </div>
                              </div>`;
      });
      shippingListTemplate += `</div>`;
      if (shippingUrl) {
        this.shippingUrl = shippingUrl;
        this.order_no = orderNo;
        this.CompanyName_name = CompanyName;
        this.showButtons_has = true;
        this.showButtons = false;
        this.showButtons2_hasnamefrombutton = false;
        this.messages.push({
          content: shippingListTemplate,
          is_customer: false,
          _id: new Date().getTime(),
        });

        setTimeout(() => {
          this.messages.push({
            content: `<div class="custom-cursor-default-hover">선택하신 주문번호는${deliveryName || "" } ${delivery_no || ""}으로 배송중입니다.<br>자세한 배송정보는 배송상세조회 페이지에서 확인하세요.<br>다른 문의가 있으신가요?</div>`,
            is_customer: false,
            createdAt: this.currentTime,
          });
          this.scrollToBottom();
        }, 500);
      } else {
        this.showButtons = true;
        this.messages.push({
          content: shippingListTemplate,
          is_customer: false,
          _id: new Date().getTime(),
        });
        setTimeout(() => {
          this.messages.push({
            content:
              "<p >선택하신 주문번호의 배송정보가 없습니다.</p> <p >자세한 배송정보는 주문상세 페이지에서 확인하세요.</p> <p >다른 문의가 있으신가요?</p>",
            is_customer: false,
            createdAt: this.currentTime,
          });
          this.scrollToBottom();
        }, 500);
        this.showButtons_has = false;
        this.showButtons2_hasnamefrombutton = false;
        this.scrollToBottom();
      }

      const orderDetails = this.ordersDetails.find(
        (item) => item.orderNo === orderNo
      );
      const orderDetailMessage1 = `주문번호: ${orderDetails.orderNo}`;
      this.messages.push({
        content: orderDetailMessage1,
        is_customer: true,
        _id: new Date().getTime(),
      });

      if (orderDetails) {
        setTimeout(() => {
          let deliveryAvailable =
            orderDetails.shippingUrl && orderDetails.shippingUrl.trim() !== "";
          let deliveryCompanyName = orderDetails.delivery_company || "택배사";
          let trackingNumber = orderDetails.delivery_no || "운송장 번호";

          // this.messages.push({
          //   _id: "orderDetailMessage2",
          //   content: ``,
          //   is_customer: false,
          //   deliveryAvailable,
          //   deliveryCompanyName,
          //   trackingNumber,
          // });

          // this.showButtons = true; // Show the buttons
        }, 400);
        this.showButtonsRow = false;
        this.showButtons2_hasnamefrombutton = false;
        this.showButtonsRow2 = false;
        this.activeContent = null;
      }
      this.scrollToBottom();
    },
    showQuestion() {
      try {
      setTimeout(() => {
        this.messages.push({
          content: "고객님께서 최근 1개월 이내 주문하신 내역이 없습니다.",
          is_customer: false,
          createdAt: this.currentTime,
        });
        this.fetchOrders();
      }, 500);
      this.showButtonsRow = false;
      this.showButtons_has = false;
      this.showButtons = false;
      this.showButtons2_hasnamefrombutton = false;
      this.showButtonsRow2 = false;
      setTimeout(() => {
        window.parent.postMessage("chatbot-hide", "*");
        window.location.reload();
      }, 3000);
      this.scrollToBottom();
    } catch (error) {
      console.error("An error occurred while showing the question:", error.message);
      // Handle the error gracefully
    }
    },

    showContent(contentType) {
      if (contentType === "deliveryInquiry") {
        try {
          setTimeout(() => {
            this.activeContent = contentType;
            this.messages.push({
              _id: "deliveryInquiry",
              content: "배송조회",
              is_customer: true,
            });
          }, 200);

          setTimeout(() => {
            this.activeContent = contentType;
            this.messages.push({
              _id: "deliveryInquiry2",
              content: "Your delivery inquiry content here",
              is_customer: false,
            });
            this.fetchOrders();
          }, 300);

          this.showDeliveryInquiry = true;
        } catch (error) {
          console.error("An error occurred during delivery inquiry:", error.message);
        }
      } else {
        try {
          this.activeContent = contentType;
          this.showDeliveryInquiry = false;
        } catch (error) {
          console.error("An error occurred while setting content type:", error.message);
        }
      }

      if (contentType === "oneToOneInquiry") {
        try {
          const now = new Date();

          const formattedTime = now.toLocaleTimeString("ko-KR", {
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Seoul",
          });

          this.messageContent = "1:1 문의";
          this.content1Active = true;

          setTimeout(() => {
            this.content1Active = true;
            this.activeContent = contentType;
            this.messages.push({
              _id: "oneToOneInquiry",
              content: "1:1 문의",
              is_customer: true,
              createdAt: formattedTime,
            });
          }, 200);

          setTimeout(() => {
            this.activeContent = contentType;
            this.messages.push({
              _id: "oneToOneInquiry",
              content: "문의 내용을 입력해주세요.",
              is_customer: false,
              createdAt: formattedTime,
            });
            this.scrollToBottom();
            this.fetchOrders();
          }, 1000);

          this.messageContent = "";
          this.createChatRoom();
          this.ismessageContent = true;
          this.showButtons = false;

          
        } catch (error) {
          console.error("An error occurred during one-to-one inquiry:", error.message);
        }
      }


      if (contentType === "orderInquiry") {
        try {
          setTimeout(() => {
            this.activeContent = contentType;
            this.messages.push({
              _id: "orderInquiry",
              content: "주문 상품문의",
              is_customer: true,
            });
          }, 200);

          setTimeout(() => {
            this.activeContent = contentType;
            this.messages.push({
              _id: "orderInquiry2",
              content: "",
              is_customer: false,
            });

            this.fetchOrders();
          }, 500);
        } catch (error) {
          console.error("An error occurred during order inquiry:", error.message);
        }
      }

      if (contentType === "returnsAndExchanges") {
        try {
          setTimeout(() => {
            this.activeContent = contentType;
            this.messages.push({
              _id: "returnsAndExchanges",
              content: "반품/교환",
              is_customer: true,
            });
          }, 200);

          setTimeout(() => {
            const link = "https://stgkia.auton.kr/mypage/purchase/list";
            window.open(link, "_blank");
          });
        } catch (error) {
          console.error("An error occurred during returns and exchanges:", error.message);
        }
      }
      this.showButtons = false;
      this.showButtonsRow = false;
      this.showButtonsRow2 = false;
      this.showButtons_has = false;
      this.showButtons2_hasnamefrombutton = false;
      this.scrollToBottom();
    },

    showContent1_1(contentType) {
      try {
        if (contentType === "oneToOneInquiry") {
          this.content1Active = true;
          this.messageContent = "1:1 문의"; // Set the message content
          this.sendMessage(); // Send the message
          const now = new Date();

          const formattedTime = now.toLocaleTimeString("ko-KR", {
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Seoul",
          });
          // Additional logic if needed
          setTimeout(() => {
            this.activeContent2 = contentType;
            this.messages.push({
              _id: "oneToOneInquiry",
              content: "문의 내용을 입력해주세요.",
              is_customer: false,
              createdAt: formattedTime,
            });
            this.scrollToBottom();
          }, 200);

        } else {
        }

        this.messageContent = "";
        this.ismessageContent = true;
        this.showButtons = false;
        this.showButtonsRow = false;
        this.showButtonsRow2 = false;
        this.showButtons_has = false;
        this.showButtons2_hasnamefrombutton = false;
        this.scrollToBottom();
      } catch (error) {
        console.error("An error occurred during content display:", error.message);
      }
    },

    showContentPrevious(contentType) {
      try {
        if (contentType === "deliveryInquiry") {
          this.fetchOrders();
          this.showButtonsRow2 = false;
        } else {
        }
        this.showContent(contentType);
        this.scrollToBottom();
        this.showButtons = false;
        this.showButtons_has = false;
      } catch (error) {
        console.error("An error occurred during content display:", error.message);
      }
    },

    showContentBackF(contentType) {
      try {
        if (contentType === "returnsAndExchanges") {
          // Clear existing messages
          // this.messages = [];

          this.showButtonsRow2 = true;
          this.showButtonsRow = false;
          this.showButtons = false;
          this.showButtons_has = false;
          this.showButtons2_hasnamefrombutton = false;
        } else {
          this.showButtonsRow2 = false;
        }

        this.scrollToBottom();
      } catch (error) {
        console.error("An error occurred during content display:", error.message);
      }
    },

    showContentdetails(contentType) {
      try {
        if (contentType) {
          const link = "https://stgkia.auton.kr/mypage/purchase/list";
          window.open(link, "_blank");
        } else {
          console.error("Invalid content type");
        }
      } catch (error) {
        console.error(
          "An error occurred while opening the link:",
          error.message
        );
      }
      this.scrollToBottom();
    },

    showContentDelivery_details(shippingUrl) {
      try {
        if (shippingUrl) {
          const link = shippingUrl;
          window.open(link, "_blank");
        } else {
          console.error("Invalid shipping URL");
        }
      } catch (error) {
        console.error(
          "An error occurred while opening the link:",
          error.message
        );
      }

      this.scrollToBottom();
    },

    async getCustomer() {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_URL}/api/login/authorization`,
          {
            jsid: this.jsessionid,
            device: this.device,
          }
        );

        this.tokenAuth = response.data.token;
        this.customer = response.data.customer;
        this.id = response.data.customer.acsid;
        this.siteCodes = response.data.customer.siteCode;
        this.name = response.data.customer.name;
        console.log("Received CUSTOMER DATA:", this.customer);

        // Store the token and id in localStorage
        localStorage.setItem("tokenAuth", this.tokenAuth);
        localStorage.setItem("id", this.id);

        this.emitSocketData();
        this.dialog = true;
      } catch (error) {
        console.error("Server error:", error.message || error);
      }
      this.scrollToBottom();
    },
    emitSocketData() {
      const emitData = {
        acsid: this.customer.acsid,
        jsessionid: this.jsessionid,
        device: this.device,
      };

      console.log("Emitting socket data:", emitData);

      if (!this.socket) {
        console.error("Socket is not initialized.");
        return;
      }

      try {
        this.socket.emit("addUser", emitData);
      } catch (socketError) {
        console.error("Socket error:", socketError.message || socketError);
      }
    },
    async fetchOperatingTime() {
      try {
        const operatingTimeResponse = await axios.get(
          `${process.env.VUE_APP_API_URL}/api/CBTSVR-URI/config/operatingTime`,
          {
            headers: {
              x_access_token: localStorage.getItem("tokenAuth"),
            },
          }
        );

        const { user: operatingTimeUser } = operatingTimeResponse.data;
        this.siteName = operatingTimeUser.site_name;
        this.workTimeStart = operatingTimeUser.work_time_start;
        this.workTimeEnd = operatingTimeUser.work_time_end;
      } catch (error) {
        console.error("Error during fetchOperatingTime:", error);
      }
      this.scrollToBottom();
    },
    async fetchDefaultGreeting() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_URL}/api/CBTSVR-URI/config/intro`,
          {
            headers: {
              x_access_token: localStorage.getItem("tokenAuth"), // Assuming your token is stored in localStorage
            },
          }
        );

        const { user } = response.data;
        this.greeting = user;
        this.showGreeting = true;
      } catch (error) {
        console.error("Error fetching default greeting:", error);
      }
      this.scrollToBottom();
    },

    async sendMessage() {
      if (!this.messageContent.trim()) {
        return;
      }
      const now = new Date();

      const formattedTime = now.toLocaleTimeString("ko-KR", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      });

      const newMessage = {
        room_id: localStorage.getItem("room_id"),
        siteCodes: this.siteCodes,
        jsid: this.jsessionid,
        content: this.messageContent,
        sender: localStorage.getItem("id"),
        name: this.name,
        customer_name: this.name,
        is_customer: true,
        createdAt: formattedTime,
      };
      // this.socket.emit("clientSendMsg", newMessage);
      // this.messages.push(newMessage);
      // await this.roomStatus();
      //   console.log("room status is " + this.room_status)
      await this.roomStatus();
      console.log("room status is " + this.room_status);
      // Check room status
      if (this.room_status === "W" || this.room_status == "") {
        this.messages.push(newMessage);
        this.socket.emit("clientSendMsg", newMessage);

        if (!this.messagePushed) {
          this.messagePushed = true;
          setTimeout(() => {
            // this.activeContent = contentType;
            this.messages.push({
              content:
                "상담사가 배정되면 상담을 시작합니다.잠시만 기다려주세요.",
              is_customer: false,
              createdAt: formattedTime,
            });
            this.scrollToBottom();
          }, 500);
        }
      } else if (this.room_status === "E") {
        this.messages.push(newMessage);
        setTimeout(() => {
          // this.activeContent = contentType;
          this.messages.push({
            content: "채팅이 종료 되었습니다",
            is_customer: false,
            createdAt: formattedTime,
          });
          this.scrollToBottom();
        }, 500);

        setTimeout(() => {
          // Refresh the page
          window.parent.postMessage("chatbot-hide", "*");
          window.location.reload();
        }, 3000);

        closeOnParent();
      } else if (this.room_status === "C") {
        // Emit the message
        this.socket.emit("clientSendMsg", newMessage);
        this.messages.push(newMessage);
        // Clear the message input
        this.messageContent = "";
      }
      // Clear the message input
      this.messageContent = "";
      this.scrollToBottom();
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const messagesContainer = this.$refs.messages;
        if (messagesContainer && messagesContainer.lastElementChild) {
          messagesContainer.lastElementChild.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    },

    async createChatRoom() {
      try {
        // Check if roomId already exists in the query parameters

        // Create a new chat room if no roomId is present in the query
        const url = `${process.env.VUE_APP_API_URL}/api/CBTSVR-URI/chatroom/create`;
        const createChatRoomResponse = await axios.post(
          url,
          {}, // Your POST data here if needed
          {
            headers: {
              x_access_token: localStorage.getItem("tokenAuth"),
            },
          }
        );

        const { user: chatRoomUser } = createChatRoomResponse.data;
        const roomId = chatRoomUser.room_id;

        store.roomId = roomId;
        localStorage.setItem("room_id", roomId);

        this.roomStatus();
      } catch (error) {
        console.error("Error during createChatRoom:", error);
      }
    },
    // check room
    async roomStatus() {
      try {
        const token = localStorage.getItem("tokenAuth");
        const _roomID = localStorage.getItem("room_id");

        const url = `${process.env.VUE_APP_API_URL}/api/findRoom/${_roomID}`;

        const getChatRoomResponse = await axios.get(url, {
          headers: {
            x_access_token: token,
          },
        });

        this.room_status = getChatRoomResponse.data.data;
      } catch (error) {
        console.error("Error during roomStatus:", error);
      }
    },
    async fetchOrders() {
      const apiUrl = "https://stgcbt.auton.kr/cbtapi/api/order/list";
      // const apiUrl = `${process.env.VUE_APP_API_URL}/api/order/list`;
      console.log("API URL:", apiUrl);
      // Prepare date parameters
      // const startDate = new Date();
      // const endDate = new Date(startDate);
      // endDate.setMonth(endDate.getMonth() - 1);
      // const formattedStartDate = startDate.toISOString().split("T")[0];
      // const formattedEndDate = endDate.toISOString().split("T")[0];
      // console.log(formattedStartDate);
      // console.log(formattedEndDate);

      // const reqData = {
      //   // siteCode: "1758634",
      //   siteCode: this.siteCodes,
      //   startDate: formattedEndDate.replace(/-/g, "/"),
      //   endDate: formattedStartDate.replace(/-/g, "/"),
      //   acsid: localStorage.getItem("id"),
      // };

      const endDate = new Date(); // Today's date
      endDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day for accurate comparison

      const startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1); // Set to the 1st day of the previous month

      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      function formatDate(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Adjust month to be in the format MM
        const day = date.getDate().toString().padStart(2, "0"); // Adjust day to be in the format DD
        return `${date.getFullYear()}/${month}/${day}`;
      }

      const reqData = {
        siteCode: this.siteCodes,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        acsid: localStorage.getItem("id"),
      };

      try {
        const response = await axios.get(apiUrl, { params: reqData });

        console.log("order list:", response.data.data);
        if (response.data && !response.data.error) {
          //set it have order
          this.isHaveOrder = true;

          // Assuming the response data contains an array of items
          this.ordersDetails = response.data.data.flatMap((order) =>
            order.orderItemList.map((item) => ({
              imgPath: item.imgPath
                ? `https://cdn.auton.kr/auton/o2o${item.imgPath}`
                : null,
              name: item.name,
              writeDate: new Date(order.writeDate).toLocaleDateString(), // Converting timestamp to readable date
              orderNo: order.orderNo,
              unitPrice: item.unitPrice,
              amount: item.amount,
              shippingUrl: item.shippingUrl,
              CompanyName: item.CompanyName,
              delivery_no: item.delivery_no,
              deliveryName: item.deliveryName,

            }))
          );
        }
      } catch (err) {
        console.error("Exception occurred while calling KIA API", err);
      }
      this.scrollToBottom();
    },
    closeOnParent: function () {
      const _roomID = localStorage.getItem("room_id");
      if (!_roomID) {
        window.parent.postMessage("chatbot-hide", "*");
        return;
      }

      const newMessage = {
        room_id: localStorage.getItem("room_id"),
        siteCodes: this.siteCodes,
        jsid: this.jsessionid,
        content: "채팅이 종료 되었습니다",
        sender: localStorage.getItem("id"),
        name: this.name,
        customer_name: this.name,
        is_customer: true,
      };
      const newMessager = {
        room_id: localStorage.getItem("room_id"),
        room_status: "E",
      };

      this.socket.emit("clientSendMsg", newMessage);
      this.socket.emit("closeToEnd", newMessager);

      // console.log(newMessager)
      localStorage.removeItem("room_id"),
        window.parent.postMessage("chatbot-hide", "*");
      window.location.reload();
    },
  },
  computed: {
    currentDate() {
      const now = new Date();
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      };
      return now.toLocaleDateString("ko-KR", options); // Format date for Korean
    },
    cuurentTime() {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("ko-KR", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      });
      this.currentTime = formattedTime;
      return formattedTime;
    },
  },
  async mounted() {
    /** getting JSESSIONID, host **/
    useEventListener(window, "message", (e) => {
      console.log(e.data.JSESSIONID);
      console.log(e.data.host);
      if (e.data.JSESSIONID != undefined) this.jsessionid = e.data.JSESSIONID;
      if (e.data.host != undefined) this.host = e.data.host;

      /** What device customer using */
      console.log("URL : ", this.host);
      if (this.host === "stgkia.auton.kr") this.device = "PC";
      else if (this.host === "stgmkia.auton.kr") this.device = "MO";
      else if (this.host === "stgcarnlife.auton.kr") this.device = "AP";

      if (this.jsessionid === "") console.log("Chatbot cannot get JSESSIONID.");
      if (this.device === "")
        console.log("Chatbot cannot get customer device.");

      if (this.jsessionid !== "" && this.device !== "") {
        this.getCustomer();
      }
    });

    //create room id
    localStorage.removeItem("room_id");
    if (this.id) {
      await this.fetchOrders();
    }
    await this.fetchOrders();
    await this.getCustomer();
    await this.fetchOperatingTime();
    setTimeout(await this.fetchDefaultGreeting, 1000);
    // this.fetchMessages();
    let roomId = "";

    this.socket = io(process.env.VUE_APP_API_SOCKET + "?roomId=" + roomId, {
      transports: ["websocket"],
    });

    // Listen for the 'getTyping' event
    this.socket.on("getStaffTyping", (data) => {
      const _roomID = localStorage.getItem("room_id");
      console.log(data.room_id === _roomID);
      if (data.room_id === _roomID) {
        this.isTyping = true;
        // console.log("Typing event received for room:", data.room_id);
      }
    });

    // Listen for the 'getStopTyping' event
    this.socket.on("getStaffStopTyping", (data) => {
      console.log(data);
      const _roomID = localStorage.getItem("room_id");
      if (data.room_id === _roomID) {
        this.isTyping = false;
        // console.log("Stop typing event received for room:", data.room_id);
      }
    });

    this.socket.on("connect", () => {
      // console.log("Socket connected!");
    });

    this.socket.on("error", (error) => {
      console.error("Exception occured while try to openned socket", error);
    });

    this.socket.on("staffGetMsg", (messageContent) => {
      // console.log("========> Received new message: ", messageContent);

      try {
        const {
          sender,
          room_id,
          content,
          is_customer,
          sender_name,
          createdAt,
        } = messageContent;

        // Use console.table for a better overview if the environment supports it
        console.table({
          Sender: sender,
          room_id: room_id,
          Content: content,
          Name: sender_name,
          Is_Customer: is_customer,
          createdAt: createdAt,
        });
        const _roomID = localStorage.getItem("room_id");
        if (_roomID === room_id) {
          // Your logic to handle the message
          this.messages.push(messageContent);
          this.scrollToBottom();
        }
      } catch (error) {
        console.error("Error processing new message:", error);
      }
    });

    // for end chat
    this.socket.on("getOnMoveToChatEnd", (Endchat) => {
      try {
        const { room_id } = Endchat;
        const _roomID = localStorage.getItem("room_id");
        if (room_id === _roomID) {
          window.parent.postMessage("chatbot-hide", "*");
          window.location.reload();
        }
      } catch (error) {
        console.error("Error processing new message:", error);
      }
    });
  },
};
