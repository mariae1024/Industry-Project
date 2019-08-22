  //to restore all to the original values

  $("#clearAll").on("click", function () {

    $("#jobName").val("");
    $('#description').val("");
    $("#payment1").prop("checked", false);
    $("#payment2").prop("checked", false);
    $("#payment3").prop("checked", false);3
    $("#options").val("Select");
    $("#startDate").val("");
    $("#endDate").val("");
    $("#upload").val("");

  })

  //to uncheck the other options

  $("#payment1").on("click", function () {

    $("#payment2").prop("checked", false);
    $("#payment3").prop("checked", false);

  })
  $("#payment2").on("click", function () {

    $("#payment1").prop("checked", false);
    $("#payment3").prop("checked", false);

  })

  $("#payment3").on("click", function () {

    $("#payment1").prop("checked", false);
    $("#payment2").prop("checked", false);

  })